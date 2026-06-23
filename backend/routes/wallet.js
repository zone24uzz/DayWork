const express = require('express')
const crypto = require('crypto')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const auth = require('../middleware/auth')

const router = express.Router()

// ─── Helper: Get or create wallet ─────────────────────
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId })
  if (!wallet) {
    wallet = await Wallet.create({ user: userId })
  }
  return wallet
}

// ─── GET /api/wallet — Get wallet balance & info ──────
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id)

    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const formatted = transactions.map((tx) => ({
      _id: tx._id,
      type: tx.type === 'deposit' || tx.type === 'refund' ? 'income' : 'expense',
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status === 'completed' ? 'completed' : 'pending',
      description: tx.description || (tx.type === 'deposit' ? 'To\'lov' : 'Chiqim'),
      detail: tx.paymentMethod !== 'none' ? `Orqali: ${tx.paymentMethod.toUpperCase()}` : '',
      createdAt: tx.createdAt,
    }))

    res.json({
      balance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalSpent: wallet.totalSpent,
      transactions: formatted,
      paymentMethods: [
        { id: 'payme', name: 'Payme', type: 'payme', number: 'Payme orqali' },
        { id: 'click', name: 'Click', type: 'click', number: 'Click orqali' },
      ],
    })
  } catch (error) {
    console.error('Get wallet error:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// ─── POST /api/wallet/deposit — Create deposit request ──
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body

    if (!amount || amount < 1000) {
      return res.status(400).json({ message: 'Minimal to\'lov: 1 000 UZS' })
    }
    if (amount > 100000000) {
      return res.status(400).json({ message: 'Maksimal to\'lov: 100 000 000 UZS' })
    }
    if (!['payme', 'click'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Noto\'g\'ri to\'lov usuli' })
    }

    const wallet = await getOrCreateWallet(req.user._id)

    // Create a pending transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      wallet: wallet._id,
      type: 'deposit',
      amount,
      status: 'pending',
      description: `Hisobni to'ldirish (${paymentMethod.toUpperCase()})`,
      paymentMethod,
    })

    // Generate payment link
    let paymentUrl = ''
    let paymentParams = {}

    if (paymentMethod === 'payme') {
      const merchantId = process.env.PAYME_MERCHANT_ID || 'YOUR_PAYME_MERCHANT_ID'
      const amountTiyin = Math.round(amount * 100) // Payme works in tiyins (cents)
      paymentParams = {
        merchant: merchantId,
        amount: amountTiyin,
        account: { order_id: String(transaction._id), user_id: String(req.user._id) },
        description: `DayWork hisobni to'ldirish: ${amount.toLocaleString()} UZS`,
      }
      paymentUrl = `https://checkout.payme.uz/${merchantId}`
    } else if (paymentMethod === 'click') {
      const serviceId = process.env.CLICK_SERVICE_ID || 'YOUR_CLICK_SERVICE_ID'
      const merchantId = process.env.CLICK_MERCHANT_ID || 'YOUR_CLICK_MERCHANT_ID'
      paymentParams = {
        service_id: serviceId,
        merchant_id: merchantId,
        amount,
        transaction_param: String(transaction._id),
        merchant_user_id: String(req.user._id),
      }
      paymentUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${transaction._id}`
    }

    res.json({
      transactionId: transaction._id,
      amount,
      paymentMethod,
      paymentUrl,
      paymentParams,
    })
  } catch (error) {
    console.error('Deposit error:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// ─── POST /api/wallet/webhook/payme — Payme callback ──
router.post('/webhook/payme', async (req, res) => {
  try {
    const { method, params } = req.body

    // Basic auth check
    const authHeader = req.headers['authorization'] || ''
    const expectedAuth = process.env.PAYME_SECRET_KEY
      ? `Basic ${Buffer.from(`Paycom:${process.env.PAYME_SECRET_KEY}`).toString('base64')}`
      : ''

    // In production, validate auth header here

    switch (method) {
      case 'CheckPerformTransaction': {
        const { account } = params
        const transaction = await Transaction.findById(account?.order_id)
        if (!transaction) {
          return res.json({ error: { code: -31050, message: { uz: 'Buyurtma topilmadi' } } })
        }
        if (transaction.status !== 'pending') {
          return res.json({ error: { code: -31051, message: { uz: 'Buyurtma allaqachon to\'langan' } } })
        }
        return res.json({ result: { allow: true } })
      }

      case 'CreateTransaction': {
        const { id: paymeTransId, time, amount, account } = params
        const transaction = await Transaction.findById(account?.order_id)
        if (!transaction) {
          return res.json({ error: { code: -31050, message: { uz: 'Buyurtma topilmadi' } } })
        }

        // Update transaction with Payme ID
        transaction.paymentTransactionId = paymeTransId
        transaction.metadata = { ...transaction.metadata, paymeCreateTime: time }
        await transaction.save()

        return res.json({
          result: {
            create_time: Number(time),
            transaction: String(paymeTransId),
            state: 1,
          },
        })
      }

      case 'PerformTransaction': {
        const { id: paymeTransId } = params
        const transaction = await Transaction.findOne({ paymentTransactionId: paymeTransId })
        if (!transaction) {
          return res.json({ error: { code: -31050, message: { uz: 'Tranzaksiya topilmadi' } } })
        }

        // Complete the deposit
        const wallet = await Wallet.findById(transaction.wallet)
        wallet.balance += transaction.amount
        wallet.totalDeposited += transaction.amount
        await wallet.save()

        transaction.status = 'completed'
        await transaction.save()

        return res.json({
          result: {
            transaction: String(paymeTransId),
            perform_time: Number(new Date()),
            state: 2,
          },
        })
      }

      case 'CancelTransaction': {
        const { id: paymeTransId, reason } = params
        const transaction = await Transaction.findOne({ paymentTransactionId: paymeTransId })
        if (transaction) {
          transaction.status = 'cancelled'
          transaction.metadata = { ...transaction.metadata, cancelReason: reason }
          await transaction.save()
        }
        return res.json({
          result: {
            transaction: String(paymeTransId),
            cancel_time: Number(new Date()),
            state: -1,
          },
        })
      }

      case 'CheckTransaction': {
        const { id: paymeTransId } = params
        const transaction = await Transaction.findOne({ paymentTransactionId: paymeTransId })
        if (!transaction) {
          return res.json({ error: { code: -31050, message: { uz: 'Tranzaksiya topilmadi' } } })
        }
        return res.json({
          result: {
            create_time: Number(transaction.createdAt),
            perform_time: transaction.status === 'completed' ? Number(transaction.updatedAt) : 0,
            cancel_time: transaction.status === 'cancelled' ? Number(transaction.updatedAt) : 0,
            transaction: String(paymeTransId),
            state: transaction.status === 'completed' ? 2 : transaction.status === 'cancelled' ? -1 : 1,
            reason: transaction.metadata?.cancelReason || null,
          },
        })
      }

      default:
        return res.json({ error: { code: -32000, message: { uz: 'Noto\'g\'ri metod' } } })
    }
  } catch (error) {
    console.error('Payme webhook error:', error)
    res.status(500).json({ error: { code: -32400, message: { uz: 'Server xatoligi' } } })
  }
})

// ─── POST /api/wallet/webhook/click — Click callback ──
router.post('/webhook/click', async (req, res) => {
  try {
    const { click_trans_id, service_id, click_paydoc_id, merchant_trans_id, amount, action, error, sign_time, sign_string } = req.body

    // Validate signature
    const secretKey = process.env.CLICK_SECRET_KEY || ''
    const expectedSign = crypto
      .createHash('md5')
      .update(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${action}${sign_time}`)
      .digest('hex')

    // In production, validate sign_string === expectedSign

    const transaction = await Transaction.findById(merchant_trans_id)
    if (!transaction) {
      return res.json({
        click_trans_id,
        merchant_trans_id,
        error: -1,
        error_note: 'Buyurtma topilmadi',
      })
    }

    if (action === 0) {
      // Prepare - Click checks if order exists
      return res.json({
        click_trans_id,
        merchant_trans_id,
        error: 0,
        error_note: 'Success',
      })
    } else if (action === 1) {
      // Complete - payment successful
      const wallet = await Wallet.findById(transaction.wallet)
      wallet.balance += transaction.amount
      wallet.totalDeposited += transaction.amount
      await wallet.save()

      transaction.status = 'completed'
      transaction.paymentTransactionId = String(click_paydoc_id || click_trans_id)
      await transaction.save()

      return res.json({
        click_trans_id,
        merchant_trans_id,
        error: 0,
        error_note: 'Success',
      })
    }

    return res.json({
      click_trans_id,
      merchant_trans_id,
      error: -2,
      error_note: 'Action not supported',
    })
  } catch (error) {
    console.error('Click webhook error:', error)
    res.status(500).json({
      click_trans_id: req.body?.click_trans_id || 0,
      merchant_trans_id: req.body?.merchant_trans_id || '',
      error: -9,
      error_note: 'Server xatoligi',
    })
  }
})

// ─── POST /api/wallet/verify — Verify payment status ──
router.post('/verify', auth, async (req, res) => {
  try {
    const { transactionId } = req.body
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user._id,
    })

    if (!transaction) {
      return res.status(404).json({ message: 'Tranzaksiya topilmadi' })
    }

    res.json({
      status: transaction.status,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
    })
  } catch (error) {
    console.error('Verify transaction error:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// ─── POST /api/wallet/simulate — Simulate payment (for testing) ──
router.post('/simulate', auth, async (req, res) => {
  try {
    const { transactionId } = req.body
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user._id,
      status: 'pending',
    })

    if (!transaction) {
      return res.status(404).json({ message: 'Tranzaksiya topilmadi yoki allaqachon to\'langan' })
    }

    // Simulate successful payment
    const wallet = await Wallet.findById(transaction.wallet)
    wallet.balance += transaction.amount
    wallet.totalDeposited += transaction.amount
    await wallet.save()

    transaction.status = 'completed'
    transaction.paymentTransactionId = `sim_${Date.now()}`
    await transaction.save()

    res.json({
      success: true,
      balance: wallet.balance,
      transaction: {
        _id: transaction._id,
        amount: transaction.amount,
        status: 'completed',
      },
    })
  } catch (error) {
    console.error('Simulate payment error:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

module.exports = router

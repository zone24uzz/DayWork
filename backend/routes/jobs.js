const express = require('express')
const Job = require('../models/Job')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/jobs - Get all active jobs
router.get('/', async (req, res) => {
  try {
    const { status, employer } = req.query
    const filter = {}

    if (status) filter.status = status
    if (employer) filter.employer = employer

    const jobs = await Job.find(filter)
      .populate('employer', 'name company')
      .sort({ createdAt: -1 })

    res.json({ jobs })
  } catch (error) {
    console.error('Get jobs error:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Noto\'g\'ri so\'rov formati' })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// GET /api/jobs/my - Get current employer's jobs
router.get('/my', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 })

    const stats = {
      total: jobs.length,
      active: jobs.filter((j) => j.status === 'active').length,
      draft: jobs.filter((j) => j.status === 'draft').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
    }

    res.json({ jobs, stats })
  } catch (error) {
    console.error('Get my jobs error:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// POST /api/jobs - Create a new job
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, location, salary, salaryPeriod, duration, workersNeeded, category, isUrgent } = req.body

    if (!title || !location || !salary) {
      return res.status(400).json({ message: 'Ish nomi, joylashuv va maosh majburiy' })
    }

    const job = await Job.create({
      employer: req.user._id,
      title,
      description,
      location,
      salary,
      salaryPeriod,
      duration,
      workersNeeded,
      category,
      isUrgent,
    })

    res.status(201).json({ job })
  } catch (error) {
    console.error('Create job error:', error)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ message: messages.join('. ') })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name company')
    if (!job) {
      return res.status(404).json({ message: 'Ish topilmadi' })
    }
    res.json({ job })
  } catch (error) {
    console.error('Get job error:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Noto\'g\'ri ish ID' })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// PUT /api/jobs/:id - Update a job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Ish topilmadi' })
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    Object.assign(job, req.body)
    await job.save()

    res.json({ job })
  } catch (error) {
    console.error('Update job error:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Noto\'g\'ri ish ID' })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ message: messages.join('. ') })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

// DELETE /api/jobs/:id - Delete a job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Ish topilmadi' })
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    await Job.findByIdAndDelete(req.params.id)
    res.json({ message: 'Ish o\'chirildi' })
  } catch (error) {
    console.error('Delete job error:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Noto\'g\'ri ish ID' })
    }
    res.status(500).json({ message: 'Server xatoligi' })
  }
})

module.exports = router
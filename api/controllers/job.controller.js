const Job = require("../models/jobs")
const ErrorHandler = require("../exceptions/ErrorHandler")
const catchAsyncErros = require("../middlewares/catchAsyncErrors")
const APIFilters = require("../utils/APIFilters")
const path = require("path")
const getJobs = catchAsyncErros(async (req, res, next) => {

    const apifilters = new APIFilters(Job.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .searchByQuery()
        .pagination()

    const jobs = await apifilters.query;

    res.json({
        success: true,
        message: "Job successfully found.",
        data: jobs
    })
})


const createNewJob = catchAsyncErros(async (req, res, next) => {

    req.body.user = req.user.id;
    const job = await Job.create(req.body)

    res.status(200).json({
        success: true,
        message: "Job successfully created",
        data: job
    })
})

const updateJob = catchAsyncErros(async (req, res, next) => {

    const id = req.params.id;
    let job = await Job.findById(id)

    if (!job && job.length === 0) {
        return next(
            new ErrorHandler("Job not found", 404)
        )
    }

    job = await Job.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res.status(200).json({
        success: true,
        message: "Job update sucess",
        data: job
    })

})

const deleteJob = catchAsyncErros(async (req, res, next) => {

    const id = req.params.id;
    let job = await Job.findById(id);

    if (!job) {
        return next(
            new ErrorHandler("Job not found", 404)
        )
    }

    job = await Job.findByIdAndDelete(id)

    return res.status(300).json({
        success: true,
        message: "Job has been deleted"
    })

})

const getJobByIdAndSlug = catchAsyncErros(async (req, res, next) => {

    const id = req.params.id;
    const slug = req.params.slug;

    const job = await Job.find({
        $and: [
            { _id: id },
            { slug: slug }
        ]
    })


    if (!job || job.length === 0) {
        return next(
            new ErrorHandler("Job not found", 404)
        )
    }

    return res.status(200).json({
        success: true,
        message: "Job has been found success.",
        data: job
    })

})

const getJobStat = catchAsyncErros(async (req, res, next) => {

    const stats = await Job.aggregate([
        {
            $match: { title: req.params.topic }
        },
        {
            $group: {
                _id: null,
                avgSalary: { $avg: "$salary" },
                minSalary: { $min: "$salary" },
                maxSalary: { $max: "$salary" },
            }
        }
    ]);

    if (stats.length === 0) {
        return next(
            new ErrorHandler("Topic not found", 404)
        )
    }

    return res.status(200).json({
        success: true,
        data: stats
    })
})

// apply job by uploading file : api/v1/job/:id/apply
const applyJob = catchAsyncErros(async (req, res, next) => {

    let job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorHandler("Job not found.", 404));
    }

    if (job.lastDate < new Date(Date.now())) {
        return next(new ErrorHandler("You can not apply this job is over.", 400))
    }

    if (!req.files) {
        return next(new ErrorHandler("Please upload file.", 400));
    }

    const file = req.files.file;

    const supportFileType = /.docs|.pdf/
    if (!supportFileType.test(path.extname(file.name))) {
        return next(new ErrorHandler("Please upload document file.", 400))
    }

    if (file.size > process.env.MAX_FILE_SIZE) {
        return next(new ErrorHandler("Please upload file less than 2M"), 400)
    }

    file.name = `${req.user.name.replace(" ", "_")}_${job.id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.UPLOAD_DOCUMENT_FILE_PATH}${file.name}`, async err => {

        if (err) {
            console.log(err)
            return next(new ErrorHandler("Upload file fail.", 500));
        }

        await Job.findByIdAndUpdate(req.params.id, {
            $push: {
                applicantsApplied: {
                    id: req.user.id,
                    resume: file.name
                }
            },
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            message: "Applied to job success.",
            data: file.name
        })
    })

})


module.exports = {
    getJobs,
    createNewJob,
    updateJob,
    deleteJob,
    getJobByIdAndSlug,
    getJobStat,
    applyJob
}
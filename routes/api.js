'use strict';

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId

const issueSchema = new mongoose.Schema({
    project: { type: String, required: true, select: false },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: '' },
    status_text: { type: String, default: '' },
    open: { type: Boolean, default: true },
    created_on: String,
    updated_on: String
});

issueSchema.pre('save', function (next) {
    if (!this.created_on) {
        this.created_on = new Date().toISOString();
    }
    this.updated_on = new Date().toISOString();
    next();
})

const Issue = mongoose.model('Issue', issueSchema);

function populateObject(source, keys, obj = {}) {
    keys.forEach(key => {
        if (source[key]) {
            obj[key] = source[key];
        }
    })
    return obj;
}

module.exports = (app) => {

    app.route('/api/issues/:project')

        .get(function (req, res) {
            const keys = ["project", "issue_title", "issue_text", "created_by",
                "assigned_to", "status_text", "created_on", "updated_on", "open"];
            let query = populateObject(req.query, keys);
            query.project = req.params.project;
            if (req.query._id) {
                query._id = ObjectId.createFromHexString(req.query._id);
            }

            Issue.find(query)
                .then((issues) => {
                    res.json(issues);
                }).catch((err) => {
                    res.status(500).json(err);
                });
        })

        .post(function (req, res) {
            const body = req.body;
            if (!body.issue_title || !body.issue_text || !body.created_by) {
                res.json({
                    error: 'required field(s) missing'
                });
                return;
            }

            const keys = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text"]
            let newIssue = new Issue(populateObject(req.body, keys));
            newIssue.project = req.params.project;

            newIssue.save()
                .then((issue) => {
                    res.json(issue);
                }).catch((err) => {
                    res.status(500).json(err);
                });
        })

        .put(function (req, res) {
            let _id = req.body._id;
            if (!_id) {
                return res.json({ error: 'missing _id' });
            }
            _id = ObjectId.createFromHexString(_id);

            let keys = ["issue_title", "issue_text", "created_by", "assigned_to",
                "status_text", "open"];
            let query = populateObject(req.body, keys);

            if (!Object.keys(query).length) {
                return res.json({ error: 'no updated field(s) sent' });
            }

            Issue.findOneAndUpdate({ _id: _id }, query)
                .then((_) => {
                    res.json({
                        result: 'successfully updated',
                        _id: _id
                    });
                }).catch((_) => {
                    res.json({
                        error: 'could not update',
                        _id: _id
                    });
                });
        })

        .delete(function (req, res) {
            let _id = req.body._id;
            if (!_id) {
                return res.json({ error: 'missing _id' });
            }
            _id = ObjectId.createFromHexString(_id);


            Issue.findOneAndDelete({ _id: _id })
                .then((_) => {
                    res.json({
                        result: 'successfully deleted',
                        _id: _id
                    });
                }).catch((_) => {
                    res.json({
                        error: 'could not delete',
                        _id: _id
                    });
                });

        });

};

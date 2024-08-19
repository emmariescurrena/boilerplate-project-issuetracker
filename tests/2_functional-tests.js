const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

chai.use(chaiHttp);

let valid_id;
const invalid_id = new ObjectId();

suite('Functional Tests', function () {
    test('Create issue with every field', (done) => {
        chai
            .request(server)
            .post("/api/issues/apitest")
            .send({
                issue_title: "This is the title",
                issue_text: "This is the text",
                created_by: "This is the creator",
                assigned_to: "This is the assigned",
                status_text: "This is the status text"
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, "This is the title");
                assert.equal(res.body.issue_text, "This is the text");
                assert.property(res.body, "open");
                assert.property(res.body, "updated_on");
                assert.property(res.body, "created_on");
                assert.property(res.body, "_id");
                valid_id = res.body._id;
                done();
            });
    });

    test('Create issue with only required fields', (done) => {
        chai
            .request(server)
            .post("/api/issues/apitest")
            .send({
                issue_title: "This is the title",
                issue_text: "This is the text",
                created_by: "This is the creator",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, "This is the title");
                assert.equal(res.body.issue_text, "This is the text");
                assert.property(res.body, "assigned_to");
                assert.property(res.body, "status_text");
                done();
            });
    });

    test('Create issue with missing required fields', (done) => {
        chai
            .request(server)
            .post("/api/issues/apitest")
            .send({
                issue_title: "This is the title",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "required field(s) missing");
                done();
            });
    });

    test('View issues on a project', (done) => {
        chai
            .request(server)
            .get("/api/issues/apitest")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.property(res.body[0], "_id");
                done();
            });
    });

    test('View issues on a project with one filter', (done) => {
        chai
            .request(server)
            .get("/api/issues/apitest")
            .query({ issue_text: "This is the text" })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.property(res.body[0], "_id");
                done();
            });
    });

    test('View issues on a project with multiple filters', (done) => {
        chai
            .request(server)
            .get("/api/issues/apitest")
            .query({
                issue_title: "This is the title",
                issue_text: "This is the text",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.property(res.body[0], "_id");
                done();
            });
    });

    test('Update one field on an issue', (done) => {
        chai
            .request(server)
            .put("/api/issues/apitest")
            .send({
                _id: valid_id,
                issue_title: "This is the new title",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully updated");
                assert.equal(res.body._id, valid_id);
                done();
            });
    });

    test('Update multiple fields on an issue', (done) => {
        chai
            .request(server)
            .put("/api/issues/apitest")
            .send({
                _id: valid_id,
                issue_title: "This is the new title",
                issue_text: "This is the new text",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully updated");
                assert.equal(res.body._id, valid_id);
                done();
            });
    });

    test('Update an issue with missing _id', (done) => {
        chai
            .request(server)
            .put("/api/issues/apitest")
            .send({
                issue_title: "This is the new title",
                issue_text: "This is the new text",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "missing _id");
                done();
            });
    });

    test('Update an issue with no fields to update', (done) => {
        chai
            .request(server)
            .put("/api/issues/apitest")
            .send({ _id: valid_id, })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "no update field(s) sent");
                assert.equal(res.body._id, valid_id);
                done();
            });
    });

    test('Update an issue with an invalid _id', (done) => {
        chai
            .request(server)
            .put("/api/issues/apitest")
            .send({
                _id: invalid_id,
                issue_title: "This is the new title",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "could not update");
                assert.equal(res.body._id, invalid_id);
                done();
            });
    });

    test('Delete an issue', (done) => {
        chai
            .request(server)
            .delete("/api/issues/apitest")
            .send({ _id: valid_id, })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully deleted");
                assert.equal(res.body._id, valid_id);
                done();
            });
    });

    test('Delete an issue with an invalid _id', (done) => {
        chai
            .request(server)
            .delete("/api/issues/apitest")
            .send({ _id: invalid_id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "could not delete");
                assert.equal(res.body._id, invalid_id);
                done();
            });
    });

    test('Delete an issue with missing _id', (done) => {
        chai
            .request(server)
            .delete("/api/issues/apitest")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "missing _id");
                done();
            });
    });

});

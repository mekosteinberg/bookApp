const express = require("express");
const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const bookSchema = new mongoose.Schema(
    {
        userid: String,
        title: { type: String, required: true },
        author: { type: String, required: true },
        genre: { type: String },
        own: { type: Boolean, required: true, default: false },
        paper: Boolean,
        audio: Boolean,
        ebook: Boolean,
        readit: { type: Boolean, required: true, default: false},
        comments: [String]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("bookshelf", bookSchema);
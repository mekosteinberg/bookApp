const express = require("express");
const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const bookSchema = new mongoose.Schema(
    {
        userid: { type: String, required: true },
        title: { type: String, required: true },
        authorFirst: { type: String, required: true },
        authorLast: { type: String, required: true },
        own: [
            {
                paper: { type: Boolean, required: true, default: false },
                audio: { type: Boolean, required: true, default: false },
                ebook: { type: Boolean, required: true, default: false }
            }],
        readStatus: { type: String, enum: ["read", "reading", "wantToRead"] },

        tags: { type: [String] },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("bookshelf", bookSchema);
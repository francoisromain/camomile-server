/*
The MIT License (MIT)

Copyright (c) 2013-2015 CNRS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HistorySchema = require('./History').HistorySchema;

var Layer = new Schema({
  id_corpus: {
    type: Schema.Types.ObjectId,
    ref: 'CorpusSchema'
  },
  name: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },
  description: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  fragment_type: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  data_type: {
    type: Schema.Types.Mixed,
    'default': ''
  },
  history: [HistorySchema],
  ACL: {
    type: Schema.Types.Mixed,
    'default': null
  },
});

Layer.statics.create = function (id_user, id_corpus, data, callback) {

  if (
    data.name === undefined ||
    data.name === '') {
    callback('Invalid name.', null);
    return;
  }

  if (data.fragment_type === undefined) {
    callback('Invalid fragment type.', null);
    return;
  }

  if (data.data_type === undefined) {
    callback('Invalid data type.', null);
    return;
  }


  var layer = new this({
    id_corpus: id_corpus,
    name: data.name,
    description: data.description,
    fragment_type: data.fragment_type,
    data_type: data.data_type,
    history: [{
      date: new Date(),
      id_user: id_user,
      changes: {
        name: data.name,
        description: data.description
      }
    }],
    ACL: {
      users: {},
      groups: {}
    }
  });

  layer.ACL.users[id_user] = _.ADMIN;

  layer.save(callback);

};



module.exports = mongoose.model('Layer', Layer);
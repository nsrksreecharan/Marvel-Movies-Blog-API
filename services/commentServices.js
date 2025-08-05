const Comment=require("../model/comment");

exports.addComment=(data)=>Comment.create(data);
exports.editComment=(id,comment)=>Comment.findByIdAndUpdate(id,{comment},{new:true});
exports.deleteComment=(id)=>Comment.findByIdAndDelete(id);
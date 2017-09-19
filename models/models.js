module.exports = function(mongoose){
	var Schema = mongoose.Schema;
	var articleSchema = Schema({
		title: String,
		link: String
	});

	var Article = mongoose.model('Article', articleSchema);

	return {
		Article: Article
	}
}


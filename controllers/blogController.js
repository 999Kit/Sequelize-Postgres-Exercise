const controller = {}
const models = require('../models');
const sequelize = require("sequelize");

controller.showList = async (req, res) => {
    const searchValue = req.query.search_value;
    const categoryFilter = req.query.category;
    const tagFilter = req.query.tag;
    const query = {
        attributes: ['id', 'title', 'imagePath', 'createdAt'],
        include: [
            { model: models.Comment, attributes: ['id'] },
        ],
    }
    if (searchValue !== undefined) {
        query.where = { title: { [sequelize.Op.iLike]: `%${searchValue}%`} }
    }
    if (categoryFilter !== undefined) {
        query.include.push({ model: models.Category, where: { name: categoryFilter} })
    }
    if (tagFilter !== undefined) {
        query.include.push({model: models.Tag, where: {name: tagFilter}})
    }
    
    const blogs = await models.Blog.findAll(query);
    const blogsPerPage = 4;
    res.locals.pagesTotal = Math.ceil(blogs.length / blogsPerPage);
    res.locals.currentPage = parseInt(req.query.p) || 1;

    query.limit = blogsPerPage;
    query.offset = (res.locals.currentPage-1)*blogsPerPage;

    res.locals.blogs = await models.Blog.findAll(query);

    res.locals.categories = await models.Category.findAll({
        attributes: ['id', 'name', [sequelize.fn('COUNT', sequelize.col('Blogs.id')), 'len']],
        include: [{ model: models.Blog, attributes: [] }],
        group: 'Category.id',
        raw: true,
    })

    res.locals.tags = await models.Tag.findAll({attributes: ['name']})

    res.render('index')
}

controller.showDetails = async (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    res.locals.blog = await models.Blog.findOne({
        attributes: ['id', 'title', 'imagePath', 'createdAt', 'description'],
        where: { id: id },
        include: [
            { model: models.Category },
            { model: models.User },
            { model: models.Tag },
            {model: models.Comment}
        ]
    })
    res.render('details')
}

module.exports = controller;
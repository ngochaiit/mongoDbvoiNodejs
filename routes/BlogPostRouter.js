var express = require('express');
var router = express.Router();
const {insertBlogPost, BlogPost, queryBlogPosts , queryBlogPostsByDateRange, getDetailBlogPost, updateBlogPost,deleteBlogPost} = require('../database/models/BlogPost')


router.use((req, res, next) =>
{
    console.log('Time', Date.now())//Time log
    next()
})
router.post('/insertBlogPost', async (req, res) => {
    
    let {title, content} = req.body;
    //Client phai gui Tokenkey
    
    let tokenKey = req.headers['x-access-token'] 
    console.log(tokenKey)
    try{
        
    let newBlogPost = await insertBlogPost(title, content, tokenKey);
    res.json({
        result: 'ok',
        message: 'Them moi BlogPost Thanh Cong',
        data: newBlogPost,
    })

    }
    catch(error)
    {
        res.json(
            {
                result: 'failed',
                message: ` khong the them moi BlogPost. Error: ${error}` 
            }
        )

    }
  
});
// router queryBlogPost
router.get('/queryBlogPosts', async (req, res) => 
{
    let {text} = req.query;
    try
    {
        let BlogPosts = await queryBlogPosts(text);
        res.json(
            {
                result: 'ok',
                message:'query thanh cong BlogPost',
                data: BlogPosts
            }
        )
    }
    catch(error)
    {
        res.json(
            {
                result: 'failed',
                message: `query khong thanh cong. Error = ${error}`
            }
        )

    }
})

//router queryBlogPostByDate

router.get('/getQueryBlogPostByDateRange', async (req, res) =>
{
    let {from, to} = req.query;

    try{
        let blogPosts = await queryBlogPostsByDateRange(from, to);
        res.json(
            {
                result: "ok",
                message: "Query thanh cong. Duoi day la danh sach",
                data: blogPosts
            }
        )
    }
    catch(error)
    {
        res.json(
            {
                result:'failed',
                message: `Query khong thanh cong. Error = ${error}`
            }
        )

    }
})
//Router hien detail BlogPosts
router.get('/getDetailBlogPost', async (req, res) =>
{
    let {id} = req.query;
    try{
        let BlogPost = await getDetailBlogPost(id);
        res.json(
            {
                result: 'ok',
                message: 'Show detail of BlogPost thanh cong',
                data: BlogPost
            }
        )
        
    }
    catch(error)
    {
        res.json(
            {
                result: 'failed',
                message: `Show detail that bai. Error = ${error}`
            }
        )
        
    }
})
//router update. Su dung method PUT de update 1 ban ghi(co token)
router.put('/update', async (req, res) =>
{
    let{id} = req.body;
    let updatedBlogPost = req.body;
    let tokenKey = req.headers['x-access-token']
    try{
        let blogPost = await updateBlogPost(id, updatedBlogPost, tokenKey)
        res.json({
            result: 'ok',
            message: 'Update thanh cong 1 BlogPost',
            data: blogPost
        })
    }
    catch(error)
    {
        res.json(
            {
                result: 'failed',
                message: `Khong update duoc BlogPost. Error = ${error}`
            }
        )
    }
})
//router delete

router.delete('/delete', async (req,res) =>
{
    let {id} = req.body;
    let tokenKey = req.headers['x-access-token']
    try{
        let deletePost = await deleteBlogPost(id, tokenKey);
        res.json(
            {
                result: 'ok',
                message: 'delete Ban ghi thanh cong',
                data: deletePost
            }
        )
    }
    catch(error)
    {
        res.json(
            {
                result:'ok',
                message: `Delete ban ghi that bai. Error = ${error}`
            }
        )
    }
    
})


module.exports = router;

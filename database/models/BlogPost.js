const {mongoose} = require('../database')
const {Schema} = mongoose
const {verifyJWT} = require('./Account')

const BlogPostSchema = new Schema({
    title: {type: String, default: 'unknown', unique: true},
    content: {type: String, default: ''},
    date: {type: Date, default: Date.now},
    //Trường tham chiếu, 1 blogpost do 1 người viết
    author:{type: mongoose.Schema.Types.ObjectId, ref: "Account"}
})
//quan he 1 user - nhieu bai post




// 1 user moi can phai them moi bai viet
//Users phai dang nhap. co token key

const insertBlogPost = async (title, content, tokenKey) => {
    try {
        //Kiểm tra đăng nhập = có tokenKey "còn hạn" ko
        let signedInUser = await verifyJWT(tokenKey)
        let newBlogPost = await BlogPost.create({
            title, content,
            date: Date.now(),
            author: signedInUser
        })
        await newBlogPost.save()
        await signedInUser.blogPosts.push(newBlogPost)
        await signedInUser.save()
        return newBlogPost
    } catch(error) {        
        throw error
    }
}

//muon xem danh sach cac blogPost => Khong can token

const queryBlogPosts = async (text) =>
{
    try{
        const blogPosts = await BlogPost.find(
            {
                $or: [
                    {
                        title: new RegExp(text, "i")
                        //i => Khong phan biet hoa thuong
                    },
                    {
                        content: new RegExp(text, "i")
                    }
                ]
            }
        )

        return blogPosts
    }
    catch(error)
    {
        throw error;
    }
}

//Lay danh sach cac bai post trong khoang tu ngay A => ngay B

const queryBlogPostsByDateRange = async (from, to) =>
{
    //format: xx - yy- zzzz
    let fromDate = new Date(parseInt(from.split('-')[2]), 
                            parseInt(from.split('-')[1])-1, 
                            parseInt(from.split('-')[0]))
    let toDate = new Date(parseInt(to.split('-')[2]), 
                            parseInt(to.split('-')[1])-1, 
                            parseInt(to.split('-')[0])) 

    try{

        let blogPosts = await BlogPost.find(
            {
                date: {$gte: fromDate, $lt: toDate}
            }
        )
        return blogPosts
    }
    catch(error)
    {
        throw error
    }
}
//Api lay noi dung chi tiet cua 1 bai post. Khong can token

const getDetailBlogPost = async (blogPostId) =>
{
    try{
        let blogPost = await BlogPost.findById(blogPostId)
        if(!blogPost)
        {
            throw `Khong tim thay BlogPost voi ID = ${blogPostId}`
        }
        return blogPost

    }
    catch(error)
    {
        throw error;
    }
}

//API Update BlogPost using token!

const updateBlogPost = async (blogPostId, updatedBlogPost, tokenKey) =>
{
    try{
        let signedInUser = await verifyJWT(tokenKey);
        console.log(signedInUser)
        let blogPost = await BlogPost.findById(blogPostId);
        if(!blogPost)
        {
            throw `Khong tim duoc BlogPost voi ID = ${blogPostId}`
        }
        if(signedInUser.id !== blogPost.author.toString())
        {
            throw "Khong update duoc vi ban khong phai tac gia cua bai viet"
        }
        blogPost.title = !updatedBlogPost.title ? blogPost.title : updatedBlogPost.title// ! kiem tra xem blogPost.title co = updateBlogPOst.title hay khong. Neu khong co UpdatePost.title thi giu nguyen
        blogPost.content = !updatedBlogPost.content ? blogPost.content : updatedBlogPost.content
        blogPost.date = Date.now()

         await blogPost.save()
         return blogPost
    }
    catch(error)
    {
        throw error

    }
}

//API xoa 1 ban ghi trong POST

const deleteBlogPost = async (blogPostId,tokenKey) =>
{
    try{
        let signedInUser = await verifyJWT(tokenKey);
        let foundBlogPost = await BlogPost.findById(blogPostId);

        if(!foundBlogPost)
        {
            throw ` Khong tim duoc bai viet co ID la: ${blogPostId}`
        }
        if(signedInUser.id !== foundBlogPost.author.toString() )
        {
            throw 'Ban Khong co quyen xoa vi khong so huu ban quyen'
        }

        await BlogPost.deleteOne({_id: blogPostId});
        signedInUser.blogPosts = await signedInUser.blogPosts.filter(eachBlogPost =>
            {
                return foundBlogPost._id.toString() !== eachBlogPost._id.toString()
            })

        await signedInUser.save()
        return signedInUser
    }
    catch(error)
    {
        throw error
    }

}
//api xoa blogs cua user dua vao Author
const deleteBlogPostByAuthor = async (authorId) =>
{
    try{
        await BlogPost.deleteMany({author: authorId})
    }
    catch(error)
    {
        throw error
    }
}

//Chuyen tu schema sang  Users
const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

module.exports = 
{
    BlogPost, insertBlogPost,queryBlogPosts, queryBlogPostsByDateRange, getDetailBlogPost, updateBlogPost, deleteBlogPost,deleteBlogPostByAuthor
}
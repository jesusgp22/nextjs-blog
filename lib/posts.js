import faunaQueries from './../fauna'

// returns an array of posts, sorted by newest
export async function getSortedPostsData() {
    const posts = await faunaQueries.getPosts()
    return posts.map(({ post, ts }) => ({
        id: post.ref.id,
        title: post.title,
        slug: post.slug,
        ts,
    }))
}


// returns an array of id objects 
// example: [{
//     params: 'first-post'
//  },
//  {
//      params:'second-post'
//  }]
export async function getAllPostIds() {
    const allPosts = await faunaQueries.getPosts()
    const ids = allPosts.map((entry) => entry.post.slug)
    return ids.map(id => {
        return {
            params: {
                id,
            }
        }
    })
}

// returns a post object
export async function getPostData(id) {
    const rawPost = await faunaQueries.getPostBySlug(id)
    
    return {
        id: rawPost.post.ref.id,
        title: rawPost.post.title,
        slug: rawPost.post.slug,
        ts: rawPost.ts,
        contentHtml: rawPost.post.content,
    }
    // Combine the data with the id and contentHtml
    //return getPost(dbs)
  }
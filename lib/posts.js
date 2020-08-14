import faunadb, { query as q } from 'faunadb';

const { FAUNADB_SECRET_KEY: secret = "fnADzOlel1ACEjDMbdiy-auXP8euYFoZHN8pIQGp" } = process.env;

let client;

if (secret) {
    client = new faunadb.Client({ secret });
}

const getPostMetadata = (post) => {
    return {
        ...post.data,
        id: post.ref.id,
        ts: post.ts/1000,
    }
}

const getPost = (post) => {
    return {
        ...post.data,
        id: post.ref.id,
        contentHtml: post.data.content,
        ts: post.ts/1000,
    }
}

export async function getSortedPostsData() {
    const dbs = await client.query(
        q.Map(q.Paginate(q.Match(q.Index('allPosts')), { size: 5 }), ref => q.Get(ref))
    )
    // ok
    return dbs.data.map(getPostMetadata)
}

export async function getAllPostIds() {
    const dbs = await client.query(
        q.Map(q.Paginate(q.Match(q.Index('allPosts')), { size: 5 }), ref => q.Get(ref))
    )
    // ok
    const ids = dbs.data.map((post) => post.data.slug)

    return ids.map(id => {
        return {
            params: {
                id,
            }
        }
    })
}

export async function getPostData(id) {
    const dbs = await client.query(
        q.Get(q.Match(q.Index('findPostBySlug'), id))
    )
    
    // Combine the data with the id and contentHtml
    return getPost(dbs)
  }
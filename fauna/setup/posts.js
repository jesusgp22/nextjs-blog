const faunadb = require('faunadb')
import { handlePromiseError } from '../helpers/errors'
const q = faunadb.query
const {
  Documents,
  CreateCollection,
  CreateIndex,
  Collection,
  Exists,
  If,
  Index,
  Delete,
  Lambda,
  Paginate,
  Let,
  Query,
  Select,
  Var,
  Add,
  TimeDiff,
  Time,
  Multiply,
  Now
} = q
/* Collection */

const CreatePostsCollection = CreateCollection({ name: 'posts' })

/* Indexes */
const CreateIndexAllPosts = CreateIndex({
  name: 'all_posts',
  source: Collection('posts'),
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  values: [
    // By including the 'created' we order them by time.
    // We could have used ts but that would have updated by 'updated' time instead.
    {
      field: ['data', 'created'],
      reverse: true
    },
    {
      field: ['ref']
    }
  ],
  // We'll be using these indexes in the logic of our application so it's safer to set serialized to true
  // That way reads will always reflect the previous writes.
  serialized: true
})

const CreateIndexPostsByReference = CreateIndex({
  name: 'posts_by_reference',
  source: Collection('posts'),
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  terms: [
    {
      field: ['ref']
    }
  ],
  values: [
    {
      field: ['ref']
    },
    {
      field: ['data', 'message']
    },
    {
      field: ['data', 'author']
    }
  ],
  serialized: true
})

const CreateIndexPostsByAuthor = CreateIndex({
  name: 'posts_by_author',
  source: Collection('posts'),
  terms: [
    {
      field: ['data', 'author']
    }
  ],
  values: [
    {
      // We want the results to be sorted on creation time
      field: ['data', 'created'],
      reverse: true
    },
    {
      field: ['ref'] // return the post reference
    }
  ],
  serialized: true
})

const CreateIndexPostsBySlug = CreateIndex({
  name: 'posts_by_slug',
  source: Collection('posts'),
  terms: [
    {
      field: ['data', 'slug']
    }
  ],
  unique: true,
  serialized: true
})

const CreateIndexPostsByHashtagRef = CreateIndex({
  name: 'posts_by_hashtag_ref',
  source: Collection('posts'),
  terms: [
    {
      field: ['data', 'hashtags']
    }
  ],
  values: [
    {
      field: ['ref'] // return the post reference
    }
  ],
  serialized: true
})

async function createPostsCollection(client) {
  await handlePromiseError(client.query(If(Exists(Collection('post')), true, CreatePostsCollection)), 'Creating posts collection')
  await handlePromiseError(client.query(If(Exists(Index('all_posts')), true, CreateIndexAllPosts)), 'Creating all_posts index')
  await handlePromiseError(client.query(If(Exists(Index('posts_by_author')), true, CreateIndexPostsByAuthor)), 'Creating posts_by_author index')
  await handlePromiseError(client.query(If(Exists(Index('posts_by_reference')), true, CreateIndexPostsByReference)), 'Creating posts_by_reference index')
  await handlePromiseError(client.query(If(Exists(Index('posts_by_hashtag_ref')), true, CreateIndexPostsByHashtagRef)), 'Creating posts_by_hasgtag_ref index')
  await handlePromiseError(client.query(If(Exists(Index('posts_by_slug')), true, CreateIndexPostsBySlug)), 'Creating posts_by_slug index')
}

// Example of how you would cleanup the collections index that are created here.
// If you delete a collection/index you have to wait 60 secs before the
// names go out of the cache before you reuse them.
async function deletePostsCollection(client) {
  await client.query(If(Exists(Collection('post')), true, Delete(Collection('post'))))
  await client.query(If(Exists(Index('all_post')), true, Delete(Index('all_post'))))
  await client.query(If(Exists(Index('post_by_author')), true, Delete(Index('post_by_author'))))
  await client.query(If(Exists(Index('post_by_reference')), true, Delete(Index('post_by_reference'))))
  await client.query(If(Exists(Index('post_by_hashtag_ref')), true, Delete(Index('post_by_hashtag_ref'))))
  await client.query(If(Exists(Index('posts_by_slug')), true, Delete(Index('post_by_slug'))))
}

// Example of how you could delete all post in a collection
const DeleteAllPosts = If(
  Exists(Collection('post')),
  q.Map(Paginate(Documents(Collection('post'))), Lambda('ref', Delete(Var('ref')))),
  true
)

export { createPostsCollection, deletePostsCollection, DeleteAllPosts }

import { flattenDataKeys } from '../helpers/util'
import { CreateHashtags } from './../queries/hashtags'
import { AddRateLimiting } from './../queries/rate-limiting'

const faunadb = require('faunadb')
const q = faunadb.query
const {
  Call,
  Create,
  Collection,
  Identity,
  Paginate,
  Documents,
  Lambda,
  Get,
  Var,
  Select,
  Let,
  Match,
  Index,
  Join,
  If,
  Exists,
  Update,
  Do,
  Add,
  Subtract,
  Not,
  Contains,
  Abort,
  Now
} = q

/* CreatePost will be used to create a user defined function
 * hence we do not execute it but return an FQL statement instead */
function CreatePost(title, content, hashtags) {
  const FQLStatement = Let(
    {
      hashtagrefs: CreateHashtags(hashtags),
      newPost: Create(Collection('posts'), {
        data: {
          title: title,
          content: content,
          author: Select(['data', 'user'], Get(Identity())),
          hashtags: Var('hashtagrefs'),
          views: 0,
          // we will order by creation time, we already have 'ts' by default but updated will also update 'ts'.
          created: Now()
        }
      }),
      // We then get the post in the same format as when we normally get them.
      // Since FQL is composable we can easily do this.
      postWithUserAndAccount: GetPostsWithUsersMapGetGeneric([Select(['ref'], Var('newPost'))])
    },
    // TODO: return a less verbose key
    Var('postWithUserAndAccount')
  )

  return AddRateLimiting('create_post', FQLStatement, Identity())
}

// We could just pass this in and create the post like this.
// However, we loaded the function in a UDF (see setup/functions)
// and added rate-limiting to it as an example to show you how UDFs can
// help you secure a piece of code as a whole.
function createPostWithoutUDF(client, title, content, hashtags) {
  return client.query(CreatePost(message, tags)).then(res => flattenDataKeys(res))
}
// Instead we call the function
// 🔌 CREATE POST API ENDPOINT
function createPost(client, title, content, hashtags = []) {
  return client.query(Call(q.Function('create_post'), title, content, hashtags)).then(res => flattenDataKeys(res))
}

// get all posts
function GetPosts() {
  const FQLStatement = GetPostsWithUsersMapGetGeneric(Paginate(Match(Index('all_posts'))))

  return AddRateLimiting('get_posts', FQLStatement, Identity())
}

// 🔌 GET ALL POSTS API ENDPOINT
function getPosts(client) {
  return client.query(Call(q.Function('get_posts'))).then(res => flattenDataKeys(res))
}

function GetPostsByTag(tagName) {
  const FQLStatement = Let(
    {
      // We only receive the tag name, not reference (since this is passed through the URL, a ref would be ugly in the url right?)
      // So let's get the tag, we assume that it still exists (if not Get will error but that is fine for our use case)
      tagReference: Select([0], Paginate(Match(Index('hashtags_by_name'), tagName))),
      res: GetPostsWithUsersMapGetGeneric(
        // Since we start of here with followerstats index (a ref we don't need afterwards, we can use join here!)
        Paginate(Match(Index('posts_by_tag'), Var('tagReference'))),
      )
    },
    Var('res')
  )

  return AddRateLimiting('get_posts_by_tag', FQLStatement, Identity())
}

// 🔌 GET ALL POSTS BY TAG API ENDPOINT
function getPostsByTag(client, tag) {
  return client.query(Call(q.Function('get_posts_by_tag'), tag)).then(res => flattenDataKeys(res))
}

/* Get posts and the user that is the author of the message.
 * This is an example of a join using Map/Get which is easy when you have the reference of the element you need.
 * a Post has the reference to the Account and an account has a reference to the user.
 */

function GetPostsWithUsersMapGetGeneric(TweetsSetRefOrArray, depth = 1) {
  // Let's do this with a let to clearly show the separate steps.
  return q.Map(
    TweetsSetRefOrArray, // for all tweets this is just Paginate(Documents(Collection('posts'))), else it's a match on an index
    Lambda(ref =>
      Let(
        {
          post: Get(Var('ref')),
          // Get the user that wrote the post.
          user: Get(Select(['data', 'author'], Var('post'))),
          // Get the account via identity
        },
        // Return our elements
        {
          user: Var('user'),
          post: Var('post'),
        }
      )
    )
  )
}

export {
  createPost,
  CreatePost,
  createPostWithoutUDF,
  GetPosts,
  getPosts,
  GetPostsByTag,
  getPostsByTag,
}

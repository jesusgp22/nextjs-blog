import faunadb from 'faunadb'

import { registerWithUser, login, logout } from './queries/auth'
import { createPost, getPosts, getPostsByTag } from './queries/posts'

/* Initialize the client to contact FaunaDB
 * The client is initially started with the a 'BOOTSTRAP' token.
 * This token has only two permissions, call the 'login' and 'register' User Defined Function (UDF)
 * If the login function succeeds, it will return a new token with elevated permission.
 * The client will then be replaced with a client that uses the secret that was returned by Login.
 */

class QueryManager {
  constructor(token) {
    // A client is just a wrapper, it does not create a persitant connection
    // FaunaDB behaves like an API and will include the token on each request.
    // TODO: properly grab this from env
    this.bootstrapToken = token || process.env.NEXT_PUBLIC_FAUNA_DB_KEY
    this.client = new faunadb.Client({
      secret: token || this.bootstrapToken
    })
  }

  login(email, password) {
    return login(this.client, email, password).then(res => {
      if (res) {
        this.client = new faunadb.Client({ secret: res.secret })
      }
      return res
    })
  }

  register(email, password, name) {
    return registerWithUser(this.client, email, password, name).then(res => {
      if (res) {
        this.client = new faunadb.Client({ secret: res.secret.secret })
      }
      return res
    })
  }

  logout() {
    return logout(this.client).then(res => {
      this.client = new faunadb.Client({
        secret: this.bootstrapToken
      })
      return res
    })
  }

  createPost(title, content, hashtags){
    return createPost(this.client, title, content, hashtags)
  }

  getPosts(){
    return getPosts(this.client)
  }

  getPostsByTag(tag){
    return getPostsByTag(this.client, tag)
  }
  
}
const faunaQueries = new QueryManager()
export { faunaQueries, QueryManager }

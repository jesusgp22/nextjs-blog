const faunadb = require('faunadb')
const q = faunadb.query
const {
  Select,
  Indexes,
  Collections,
  CreateRole,
  Paginate,
  Roles,
  Role,
  Lambda,
  Delete,
  Var,
  Collection,
  Index,
  If,
  Exists,
  Update,
  Union
} = q

// A convenience function to either create or update a role.
function CreateOrUpdateRole(obj) {
  return If(
    Exists(Role(obj.name)),
    Update(Role(obj.name), { membership: obj.membership, privileges: obj.privileges }),
    CreateRole(obj)
  )
}

// This role.. can't do anything. It's used as an example in the tests
const CreatePowerlessRole = CreateOrUpdateRole({
  name: 'powerless',
  privileges: []
})

// When a user first arrives to the application, he should only be able to create a new account (register UDF) and login with a given account (login UDF)
// This role will be used to generate a key to bootstrap this process.
const CreateBootstrapRole = CreateOrUpdateRole({
  name: 'keyrole_calludfs',
  privileges: [
    {
      resource: q.Function('login'),
      actions: {
        call: true
      }
    },
    // TODO: might want to comment these privileges for a system that doesn't allow register
    {
      resource: q.Function('register'),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function('register_with_user'),
      actions: {
        call: true
      }
    }
  ]
})

const CreateBootstrapRoleSimple = CreateOrUpdateRole({
  name: 'keyrole_calludfs',
  privileges: [
    {
      resource: q.Function('login'),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function('register'),
      actions: {
        call: true
      }
    }
  ]
})

// The register function only needs to be able to create accounts.
const CreateFnRoleRegister = CreateOrUpdateRole({
  name: 'functionrole_register',
  privileges: [
    {
      resource: Collection('accounts'),
      actions: { create: true } // write is to update, create to create new instances
    },
    {
      resource: Collection('rate_limiting'),
      actions: { read: true, write: true, create: true }
    },
    {
      resource: Index('rate_limiting_by_action_and_identity'),
      actions: { read: true }
    }
  ]
})

// The register function which creates users immediately
// also needs to be able to create users.
const CreateFnRoleRegisterWithUser = CreateOrUpdateRole({
  name: 'functionrole_register_with_user',
  privileges: [
    {
      resource: Collection('accounts'),
      actions: { create: true, read: true } // write is to update, create to create new instances
    },
    {
      resource: Collection('users'),
      actions: { create: true }
    },
    {
      resource: Collection('rate_limiting'),
      actions: { read: true, write: true, create: true, history_read: true, delete: true }
    },
    {
      resource: Index('rate_limiting_by_action_and_identity'),
      actions: { read: true }
    }
  ]
})

// The login function only needs to be able to Login into accounts with the 'Login' FQL function.
// That FQL function requires a reference and we will get the account reference with an index.
// Therefore it needs read access to the 'accounts_by_email' index. Afterwards it will return the
// account so the frontend has the email of the user so we also need read access to the 'accounts' collection
const CreateFnRoleLogin = CreateOrUpdateRole({
  name: 'functionrole_login',
  privileges: [
    {
      resource: Index('accounts_by_email'),
      actions: { read: true }
    },
    {
      resource: Collection('accounts'),
      actions: { read: true }
    },
    {
      resource: Collection('users'),
      actions: { read: true }
    },
    {
      resource: Collection('rate_limiting'),
      actions: { write: true, history_read: true, create: true, read: true, delete: true }
    },
    {
      resource: Index('rate_limiting_by_action_and_identity'),
      actions: { read: true }
    },
    {
      resource: Collection('users'),
      actions: { read: true }
    }
  ]
})

// In case you don't need rate limiting
const CreateFnRoleLoginWithoutRateLimiting = CreateOrUpdateRole({
  name: 'functionrole_login',
  privileges: [
    {
      resource: Index('accounts_by_email'),
      actions: { read: true }
    },
    {
      resource: Collection('accounts'),
      actions: { read: true }
    }
  ]
})

const CreateFnRoleRegisterWithoutRateLimiting = CreateOrUpdateRole({
  name: 'functionrole_register',
  privileges: [
    {
      resource: Collection('accounts'),
      actions: { create: true } // write is to update, create to create new instances
    }
  ]
})

const CreateLoggedInRole = CreateOrUpdateRole({
  name: 'membershiprole_loggedin',
  membership: [{ resource: Collection('accounts') }],
  privileges: [
    // these are all the User Defined Functions
    // that a logged in user can call. All our manipulations
    // are encapsulated in User Defined Functions which makes it easier
    // to limit what data and how a user can adapt data.

    // all UDFs for manipulating posts goes here
    {
      resource: q.Function('create_post'),
      actions: {
        call: true
      }
    },
    // {
    //   resource: q.Function('edit_post'),
    //   actions: {
    //     call: true
    //   }
    // },
    {
      resource: q.Function('get_posts'),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function('get_posts_by_tag'),
      actions: {
        call: true
      }
    },
    {
      resource: Collection('users'),
      actions: { read: true }
    },
    {
      resource: Collection('hashtags'),
      actions: { read: true }
    }
  ]
})

const CreateFnRoleManipulatePost = CreateOrUpdateRole({
  name: 'functionrole_manipulate_posts',
  privileges: [
    /** *********************** WRITE AND UPDATE PRIVILEGES *************************/
    // Of course the function needs to update a fweet
    {
      resource: Collection('posts'),
      actions: { create: true, write: true, update: true }
    },
    // But it also needs to read and update rate limiting stats.
    {
      resource: Collection('rate_limiting'),
      actions: { write: true, history_read: true, create: true }
    },
    {
      resource: Collection('hashtags'),
      actions: { create: true }
    },
    /** *********************** READ PRIVILEGES *************************/
    {
      resource: Collection('posts'),
      actions: { read: true }
    },
    {
      resource: Index('all_posts'),
      actions: { read: true }
    },
    {
      resource: Index('rate_limiting_by_action_and_identity'),
      actions: { read: true }
    },
    // We fetch accounts and user to return these together with the fweet.
    {
      resource: Collection('accounts'),
      actions: { read: true }
    },
    {
      resource: Collection('users'),
      actions: { read: true }
    },
    {
      resource: Collection('rate_limiting'),
      actions: { read: true }
    },
    // {
    //   // To search
    //   resource: Index('hashtags_and_users_by_wordparts'),
    //   actions: { read: true }
    // },
    {
      // To check whether a hashtag already exists
      resource: Index('hashtags_by_name'),
      actions: { read: true }
    },
    {
      resource: Collection('hashtags'),
      actions: { read: true }
    },
    {
      resource: Index('posts_by_author'),
      actions: { read: true }
    },
  ]
})

const CreateAllMightyRole = CreateOrUpdateRole({
  name: 'membershiprole_loggedinallmighty',
  membership: [{ resource: Collection('accounts') }],
  // Whatever indexes/collection that exist, give the account access.
  // !! This is a convience for tests only, do not add this role to a running application.
  privileges: Union(
    Select(
      ['data'],
      q.Map(
        Paginate(Collections()),
        Lambda('c', {
          resource: Var('c'),
          actions: {
            read: true,
            write: true,
            create: true,
            delete: true,
            history_read: true,
            history_write: true,
            unrestricted_read: true
          }
        })
      )
    ),
    Select(
      ['data'],
      q.Map(
        Paginate(Indexes()),
        Lambda('c', {
          resource: Var('c'),
          actions: {
            read: true,
            unrestricted_read: true
          }
        })
      )
    )
  )
})

const DeleteAllRoles = q.Map(Paginate(Roles()), Lambda('ref', Delete(Var('ref'))))

export {
  CreateBootstrapRole,
  CreateBootstrapRoleSimple,
  CreatePowerlessRole,
  CreateFnRoleRegister,
  CreateFnRoleRegisterWithoutRateLimiting,
  CreateFnRoleLogin,
  CreateFnRoleLoginWithoutRateLimiting,
  DeleteAllRoles,
  CreateLoggedInRole,
  CreateAllMightyRole,
  CreateFnRoleRegisterWithUser,
  CreateFnRoleManipulatePost
}

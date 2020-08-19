
  import { RegisterWithUser, RegisterAccount, LoginAccount, LoginAccountExample1 } from '../queries/auth'
  
  const faunadb = require('faunadb')
  const q = faunadb.query
  const { Var, Query, Lambda, Exists, If, Update, Select, Get, CreateFunction, Role, Identity } = q
  
  // A convenience function to either create or update a function.
  function CreateOrUpdateFunction(obj) {
    return If(
      Exists(q.Function(obj.name)),
      Update(q.Function(obj.name), { body: obj.body, role: obj.role }),
      CreateFunction({ name: obj.name, body: obj.body, role: obj.role })
    )
  }
  
  /* ********** Insert them as User Defined functions *********** */
  /* If this statement is executed it will be executed as a user defined function.
   * We use a wrapper helper to make sure that we override a function with 'Update' in case it alread exists
   * and Create it with 'CreateFunction' if it did not exist yet.
   * User Defined Functions (UDF): https://docs.fauna.com/fauna/current/api/graphql/functions
   * CreateFunction: https://docs.fauna.com/fauna/current/api/fql/functions/createfunction
   * Update: https://docs.fauna.com/fauna/current/api/fql/functions/update
   */
  const CreateAccountUDF = CreateOrUpdateFunction({
    name: 'register',
    // Note that 'Lambda' requires two parameters to be provided when you call the User Defined Function.
    // The parameters will be bound to the variables 'email' and 'password' which are used by the functions that we pass in.
    // Since these functions are in the scope of this lambda, they can access these varaibles.
    // (see above how these functions use Var('email) and Var('password).
  
    // TODO - simple email format verification and password verification.
    // ContainsStrRegex(
    //   'test@gmail.com',
    //   "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
  
    body: Query(Lambda(['email', 'password'], RegisterAccount(Var('email'), Var('password')))),
    role: Role('functionrole_register')
  })
  
  // Let's show a second example where the function immediately adds a user that is linked to the account.
  const CreateAccountWithUserUDF = CreateOrUpdateFunction({
    name: 'register_with_user',
    body: Query(
      Lambda(
        ['email', 'password', 'name'],
        RegisterWithUser(Var('email'), Var('password'), Var('name'))
      )
    ),
    role: Role('functionrole_register_with_user')
  })
  
  const CreateAccountWithUserNoRatelimitingUDF = CreateOrUpdateFunction({
    name: 'register_with_user',
    body: Query(
      Lambda(
        ['email', 'password', 'name'],
        RegisterWithUser(Var('email'), Var('password'), Var('name'), false)
      )
    ),
    role: Role('functionrole_register_with_user')
  })
  
  const CreateLoginUDF = CreateOrUpdateFunction({
    name: 'login',
    body: Query(Lambda(['email', 'password'], LoginAccount(Var('email'), Var('password')))),
    role: Role('functionrole_login')
  })
  
  const CreateLoginSimpleUDF = CreateOrUpdateFunction({
    name: 'login',
    body: Query(Lambda(['email', 'password'], LoginAccountExample1(Var('email'), Var('password')))),
    role: Role('functionrole_login')
  })
  
  export {
    CreateAccountUDF,
    CreateAccountWithUserUDF,
    CreateAccountWithUserNoRatelimitingUDF,
    CreateLoginUDF,
    CreateLoginSimpleUDF,
    CreateOrUpdateFunction
  }
  
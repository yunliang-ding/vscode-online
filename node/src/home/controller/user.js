const uuidv1 = require('uuid/v1')
class User{
  constructor(){
    this.token = uuidv1()
  }
}
const user = new User()
export {
  user as User
}
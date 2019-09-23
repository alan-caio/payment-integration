import User from '../User/User.model';
import auth from '../../src/auth/requestHandlers';

const Auth = auth(User);

const authController = {
  login: Auth.login,
  me: Auth.me,
  check: Auth.check
};

export default authController;

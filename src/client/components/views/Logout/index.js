import React, { useEffect } from 'react';
import { useUser } from '../../data/User';
import Minimal from '../../templates/Minimal';
import Button from '../../elements/Button';

import './index.scss';

const { routes: { admin } } = PAYLOAD_CONFIG;

const baseClass = 'logout';

const Logout = () => {
  const { logOut } = useUser();

  useEffect(() => {
    logOut();
  }, [logOut]);

  return (
    <Minimal className={baseClass}>
      <div className={`${baseClass}__wrap`}>
        <h1>You have been logged out.</h1>
        <br />
        <Button
          el="anchor"
          type="secondary"
          url={`${admin}/login`}
        >
          Log back in
        </Button>
      </div>
    </Minimal>
  );
};

export default Logout;

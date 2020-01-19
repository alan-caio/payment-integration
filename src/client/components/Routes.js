import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import {
  Route, Switch, withRouter, Redirect,
} from 'react-router-dom';
import config from 'payload-config';
import DefaultTemplate from './layout/DefaultTemplate';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import CreateFirstUser from './views/CreateFirstUser';
import CreateUser from './views/CreateUser';
import MediaLibrary from './views/MediaLibrary';
import Edit from './views/collections/Edit';
import List from './views/collections/List';
import { requests } from '../api';

const cookies = new Cookies();

const Routes = () => {
  const [initialized, setInitialized] = useState(null);

  useEffect(() => {
    requests.get('/init').then(res => res.json().then((data) => {
      if (data && 'initialized' in data) {
        setInitialized(data.initialized);
      }
    }));
  }, []);

  return (
    <Route
      path="/admin"
      render={({ match }) => {
        if (initialized === false) {
          return (
            <Switch>
              <Route path={`${match.url}/create-first-user`}>
                <CreateFirstUser />
              </Route>
              <Route>
                <Redirect to="/admin/create-first-user" />
              </Route>
            </Switch>
          );
        } if (initialized === true) {
          return (
            <Switch>
              <Route path={`${match.url}/login`}>
                <Login />
              </Route>
              <Route path={`${match.url}/forgot`}>
                <h1>Forgot Password</h1>
              </Route>
              <Route
                render={() => {
                  if (cookies.get('token')) {
                    return (
                      <DefaultTemplate>
                        <Route
                          path={`${match.url}/media-library`}
                          component={MediaLibrary}
                        />
                        <Route
                          path={`${match.url}/create-user`}
                          component={CreateUser}
                        />
                        <Route
                          path={`${match.url}/`}
                          exact
                          component={Dashboard}
                        />

                        {config.collections.map((collection) => {
                          const components = collection.components ? collection.components : {};
                          return (
                            <Switch key={collection.slug}>
                              <Route
                                path={`${match.url}/collections/${collection.slug}/create`}
                                exact
                                render={(routeProps) => {
                                  return (
                                    <Edit
                                      {...routeProps}
                                      collection={collection}
                                    />
                                  );
                                }}
                              />

                              <Route
                                path={`${match.url}/collections/${collection.slug}/:id`}
                                exact
                                render={(routeProps) => {
                                  return (
                                    <Edit
                                      {...routeProps}
                                      collection={collection}
                                    />
                                  );
                                }}
                              />

                              <Route
                                path={`${match.url}/collections/${collection.slug}`}
                                exact
                                render={(routeProps) => {
                                  const ListComponent = components.List ? components.List : List;
                                  return (
                                    <ListComponent
                                      {...routeProps}
                                      collection={collection}
                                    />
                                  );
                                }}
                              />

                            </Switch>
                          );
                        })}
                      </DefaultTemplate>
                    );
                  }
                  return <Redirect to="/admin/login" />;
                }}
              />
            </Switch>
          );
        }

        return null;
      }}
    />
  );
};

export default withRouter(Routes);
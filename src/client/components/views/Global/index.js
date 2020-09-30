import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import { useConfig } from '../../providers/Config';
import { useStepNav } from '../../elements/StepNav';
import usePayloadAPI from '../../../hooks/usePayloadAPI';
import { useAuthentication } from '../../providers/Authentication';
import { useLocale } from '../../utilities/Locale';

import RenderCustomComponent from '../../utilities/RenderCustomComponent';
import DefaultGlobal from './Default';
import buildStateFromSchema from '../../forms/Form/buildStateFromSchema';

const GlobalView = (props) => {
  const { state: locationState } = useLocation();
  const history = useHistory();
  const locale = useLocale();
  const { setStepNav } = useStepNav();
  const { permissions } = useAuthentication();
  const [initialState, setInitialState] = useState({});

  const {
    serverURL,
    routes: {
      admin,
      api,
    },
  } = useConfig();

  const { global } = props;

  const {
    slug,
    label,
    fields,
    admin: {
      components: {
        views: {
          Edit: CustomEdit,
        } = {},
      } = {},
    } = {},
  } = global;

  const onSave = (json) => {
    history.push(`${admin}/globals/${global.slug}`, {
      status: {
        message: json.message,
        type: 'success',
      },
      data: json.doc,
    });
  };

  const [{ data }] = usePayloadAPI(
    `${serverURL}${api}/globals/${slug}`,
    { initialParams: { 'fallback-locale': 'null', depth: 0 } },
  );

  const dataToRender = locationState?.data || data;

  useEffect(() => {
    const nav = [{
      label,
    }];

    setStepNav(nav);
  }, [setStepNav, label]);

  useEffect(() => {
    const awaitInitialState = async () => {
      const state = await buildStateFromSchema(fields, dataToRender);
      setInitialState(state);
    };

    awaitInitialState();
  }, [dataToRender, fields]);

  const globalPermissions = permissions?.[slug];

  return (
    <RenderCustomComponent
      DefaultComponent={DefaultGlobal}
      CustomComponent={CustomEdit}
      componentProps={{
        data: dataToRender,
        permissions: globalPermissions,
        initialState,
        global,
        onSave,
        apiURL: `${serverURL}${api}/globals/${slug}?depth=0`,
        action: `${serverURL}${api}/globals/${slug}?locale=${locale}`,
      }}
    />
  );
};

GlobalView.propTypes = {
  global: PropTypes.shape({
    label: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    admin: PropTypes.shape({
      components: PropTypes.shape({
        Edit: PropTypes.node,
      }),
    }),
  }).isRequired,
};

export default GlobalView;

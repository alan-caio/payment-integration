import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import config from 'payload/config';
import { useStepNav } from '../../elements/StepNav';
import usePayloadAPI from '../../../hooks/usePayloadAPI';
import { useUser } from '../../data/User';
import { useLocale } from '../../utilities/Locale';

import RenderCustomComponent from '../../utilities/RenderCustomComponent';
import DefaultGlobal from './Default';
import buildStateFromSchema from '../../forms/Form/buildStateFromSchema';

const { serverURL, routes: { admin, api } } = config;

const GlobalView = (props) => {
  const { state: locationState } = useLocation();
  const history = useHistory();
  const locale = useLocale();
  const { setStepNav } = useStepNav();
  const { permissions } = useUser();
  const [initialState, setInitialState] = useState({});

  const { global } = props;

  const {
    slug,
    label,
    fields,
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
      path={`${slug}.views.Edit`}
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
  }).isRequired,
};

export default GlobalView;

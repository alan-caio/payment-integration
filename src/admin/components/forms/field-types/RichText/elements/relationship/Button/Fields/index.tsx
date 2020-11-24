import React, { Fragment, useState, useEffect } from 'react';
import { useConfig, useAuth } from '@payloadcms/config-provider';
import { useFormFields } from '../../../../../../Form/context';
import Relationship from '../../../../../Relationship';
import Number from '../../../../../Number';
import Select from '../../../../../Select';


const createOptions = (collections, permissions) => collections.reduce((options, collection) => {
  if (permissions?.collections?.[collection.slug]?.read?.permission && collection?.admin?.enableRichTextRelationship) {
    return [
      ...options,
      {
        label: collection.labels.plural,
        value: collection.slug,
      },
    ];
  }

  return options;
}, []);

const RelationshipFields = () => {
  const { collections, maxDepth } = useConfig();
  const { permissions } = useAuth();

  const [options, setOptions] = useState(() => createOptions(collections, permissions));

  const { getData } = useFormFields();
  const { relationTo } = getData();

  useEffect(() => {
    setOptions(createOptions(collections, permissions));
  }, [collections, permissions]);

  return (
    <Fragment>
      <Select
        required
        label="Relation To"
        name="relationTo"
        options={options}
      />
      {relationTo && (
        <Relationship
          label="Related Document"
          name="value"
          relationTo={relationTo}
          required
        />
      )}
      <Number
        required
        name="depth"
        label="Depth"
        min={0}
        max={maxDepth}
      />
    </Fragment>
  );
};

export default RelationshipFields;

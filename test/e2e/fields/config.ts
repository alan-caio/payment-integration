import { buildConfig } from '../buildConfig';
import { devUser } from '../../credentials';
import { seededDoc } from './shared';

export const slug = 'docs';

export default buildConfig({
  collections: [
    {
      slug,
      admin: {
        useAsTitle: 'text',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  onInit: async (payload) => {
    await payload.create({
      collection: 'users',
      data: {
        email: devUser.email,
        password: devUser.password,
      },
    });

    await payload.create({
      collection: slug,
      data: seededDoc,
    });
  },
});

import { factories } from '@strapi/strapi';

const REQUIRED_FIELDS = ['full_name', 'email', 'phone', 'address', 'city'] as const;

const DELIVERY_PROFILE_UID = 'api::delivery-profile.delivery-profile' as any;

export default factories.createCoreController(DELIVERY_PROFILE_UID, ({ strapi }) => ({
  async me(ctx: any) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const profile = await strapi.db.query(DELIVERY_PROFILE_UID).findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    ctx.send({ data: profile ?? null });
  },

  async upsertMe(ctx: any) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const payload = normalizeDeliveryProfilePayload(ctx.request.body?.data || {});

    for (const field of REQUIRED_FIELDS) {
      if (!payload[field]) {
        return ctx.badRequest(`Missing required field: ${field}`);
      }
    }

    const existingProfile = await strapi.db.query(DELIVERY_PROFILE_UID).findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    if (existingProfile) {
      const updatedProfile = await strapi.documents(DELIVERY_PROFILE_UID).update({
        documentId: existingProfile.documentId,
        data: payload as any,
      });

      ctx.send({ data: updatedProfile });
      return;
    }

    const createdProfile = await strapi.documents(DELIVERY_PROFILE_UID).create({
      data: {
        ...payload,
        user: user.id,
      } as any,
    });

    ctx.send({ data: createdProfile });
  },
}));

const normalizeDeliveryProfilePayload = (data: Record<string, unknown>) => ({
  full_name: normalizeText(data.full_name),
  email: normalizeText(data.email),
  phone: normalizeText(data.phone),
  address: normalizeText(data.address),
  city: normalizeText(data.city),
  notes: normalizeText(data.notes),
});

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
};

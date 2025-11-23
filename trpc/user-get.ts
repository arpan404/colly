import { protectedProcedure } from './init';

export const userGet = protectedProcedure.query(({ ctx }) => {
  return { id: ctx.user.id, email: ctx.user.email };
});
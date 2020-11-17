import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";

const buildTicket = async ({
  title,
  price,
}: {
  title: string;
  price: number;
}) => {
  const ticket = Ticket.build({ title, price });
  await ticket.save();
  return ticket;
};

const createOrder = async (user: string[], ticketId: string) => {
  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticketId });

  return order;
};

it("fetches orders for a particular user", async () => {
  const ticket1 = await buildTicket({ title: "Concert", price: 50 });
  const ticket2 = await buildTicket({ title: "Johnny English", price: 20 });
  const ticket3 = await buildTicket({ title: "Interstellar", price: 20 });

  const userOne = global.signin();
  const userTwo = global.signin();

  await createOrder(userOne, ticket1.id);
  const { body: orderOne } = await createOrder(userTwo, ticket2.id);
  const { body: orderTwo } = await createOrder(userTwo, ticket3.id);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .send({})
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id);
});

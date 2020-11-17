import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import {natsWrapper} from '../../nats-wrapper';

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "asdasd",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "asdasd",
      price: 20,
    })
    .expect(401);
});

it("returns a 401 if the user does not own a ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Interstellar",
      price: 20,
    });

  const id = response.body.id;
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Interstellar",
      price: 200,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const response = request(app).put("/api/tickets").set("Cookie", cookie).send({
    title: "Inception",
    price: 20,
  });

  await request(app)
    .put(`/api/tickets/${(await response).body.id}`)
    .set("Cookie", cookie)
    .send({})
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "Justice League",
      price: 30,
    });

  const updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Justice League : War on Apocalypse",
      price: 30,
    });

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send({});

  expect(updatedResponse.body.title).toEqual(ticketResponse.body.title);
  expect(updatedResponse.body.price).toEqual(ticketResponse.body.price);
});

it('publishes an event', async()=>{
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "Justice League",
      price: 30,
    });

  const updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Justice League : War on Apocalypse",
      price: 30,
    });

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
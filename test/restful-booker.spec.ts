import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Restful Booker', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://restful-booker.herokuapp.com';
  
  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Authentication Token', () => {
    it('Deve gerar um token de acesso', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth`)
        .withJson({
            "username" : "admin",
            "password" : "password123"
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
            "token": /.+/
        })
        .inspect()
      });
    })

  describe('Booking', () => {
    it('Retorna os IDs de todas as reservas existentes na API', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([{
            "bookingid": /.+/
        }])
        .inspect()
      });
    })

  describe('Booking', () => {
    it('Deve gerar uma nova reserva e retornar as informações juntamente com um ID', async () => {
      await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withJson({
            "firstname" : "Optimus",
            "lastname" : "Prime",
            "totalprice" : 150,
            "depositpaid" : true,
            "bookingdates" : {
                "checkin" : "2026-04-13",
                "checkout" : "2026-04-17"
            },
            "additionalneeds" : "Breakfast"
        })
        .expectStatus(StatusCodes.OK)
        .inspect()
      });
    })
})
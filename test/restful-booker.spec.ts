import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Restful Booker - Full Coverage & Negative Tests', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  afterAll(() => p.reporter.end());

  describe('Health Check', () => {
    it('Deve verificar se a API está online', async () => {
      await p
        .spec()
        .get(`${baseUrl}/ping`)
        .expectStatus(StatusCodes.CREATED);
    });
  });

  describe('Authentication Token', () => {
    it('Deve gerar um token de acesso', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth`)
        .withJson({
          username: "admin",
          password: "password123"
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          token: /.+/
        })
        .stores('token', 'token');
    });
  });

  describe('Booking Flow (Happy Path)', () => {
    it('Deve criar uma nova reserva', async () => {
      await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withHeaders('Accept', 'application/json')
        .withJson({
          firstname: "Optimus",
          lastname: "Prime",
          totalprice: 150,
          depositpaid: true,
          bookingdates: {
            checkin: "2026-04-13",
            checkout: "2026-04-17"
          },
          additionalneeds: "Breakfast"
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          bookingid: /.+/
        })
        .stores('bookingId', 'bookingid')
        .inspect();
    });

    it('Deve retornar os detalhes da reserva criada', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/{id}`)
        .withPathParams('id', '$S{bookingId}')
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: "Optimus",
          lastname: "Prime"
        });
    });

    it('Deve atualizar a reserva completamente (PUT)', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/{id}`)
        .withPathParams('id', '$S{bookingId}')
        .withHeaders({
          'Cookie': 'token=$S{token}',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
        .withJson({
          firstname: "Optimus",
          lastname: "Prime",
          totalprice: 200,
          depositpaid: true,
          bookingdates: {
            checkin: "2026-04-13",
            checkout: "2026-04-20"
          },
          additionalneeds: "Lunch"
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonMatch({ totalprice: 200 });
    });

    it('Deve atualizar a reserva parcialmente (PATCH)', async () => {
      await p
        .spec()
        .patch(`${baseUrl}/booking/{id}`)
        .withPathParams('id', '$S{bookingId}')
        .withHeaders({
          'Cookie': 'token=$S{token}',
          'Accept': 'application/json'
        })
        .withJson({
          firstname: "Ultra"
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonMatch({ firstname: "Ultra" });
    });

    it('Deve excluir a reserva', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/booking/{id}`)
        .withPathParams('id', '$S{bookingId}')
        .withHeaders({
          'Cookie': 'token=$S{token}',
          'Content-Type': 'application/json'
        })
        .expectStatus(StatusCodes.CREATED);
    });

    it('Deve garantir que a reserva não existe mais', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/{id}`)
        .withPathParams('id', '$S{bookingId}')
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  describe('Negative Scenarios', () => {
    it('Deve retornar 404 ao buscar um ID de reserva inexistente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/999999999`)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('Deve retornar 403 ao tentar excluir sem token de autenticação', async () => {
      await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withHeaders('Accept', 'application/json')
        .withJson({
          firstname: "Tentativa",
          lastname: "Falha",
          totalprice: 50,
          depositpaid: false,
          bookingdates: { checkin: "2026-01-01", checkout: "2026-01-02" },
          additionalneeds: "None"
        })
        .stores('tempId', 'bookingid');

      await p
        .spec()
        .delete(`${baseUrl}/booking/{id}`)
        .withPathParams('id', '$S{tempId}')
        .expectStatus(StatusCodes.FORBIDDEN);
    });
  });
});
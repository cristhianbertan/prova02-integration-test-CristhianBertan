import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Dungeons and Dragons', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'http://dnd-combat-api-7f3660dcecb1.herokuapp.com/api';
  const monster = 'goblin';
  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Character', () => {
    it('Retorna um exemplo de personagem', async () => {
      await p
        .spec()
        .get(`${baseUrl}/characters/example`)
        .returns('res.body')
        .expectJson({
          "name": "Kaya",
          "strength": 10,
          "dexterity": 7,
          "hitPoints": 11,
          "armorClass": 12
        })
        .expectStatus(StatusCodes.OK)
      });
    })

  describe('Monsters', () => {
    it('Retorna uma lista de monstros (1-65 páginas)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/monsters/names/1`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('Adult River Dragon');
      });
    })

   describe('Monsters', () => {
    it('Deve retornar "HTTP Status Code 500 - INTERNAL SERVER ERROR" ao retorar utilizar uma lista que não existe', async () => {
      await p
        .spec()
        .get(`${baseUrl}/monsters/names/66`)
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR)
      });
    })

  describe('Battle', () => {
    it('Simula uma batalha entre personagem e monstro', async () => {
      await p
        .spec()
        .post(`${baseUrl}/battle/${monster}`)
        .withJson({
          "name": "Kaya",
          "strength": 10,
          "dexterity": 7,
          "hitPoints": 11,
          "armorClass": 12
        })
        .expectStatus(StatusCodes.OK)
        .inspect()
      });
    })

  describe('Character', () => {
    it('Valida o personagem', async () => {
      await p
        .spec()
        .post(`${baseUrl}/characters/check`)
        .withJson({
          "name": "Kaya",
          "strength": 10,
          "dexterity": 7,
          "hitPoints": 11,
          "armorClass": 12
        })
        .expectStatus(StatusCodes.OK);
      });
    })
  });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/sessions (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'test8@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
  });

  it('/google/callback (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/google/callback')
      .expect(302);
  });

  it('/signup (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/signup')
      .send({
        email: '11emai1l@gmail.com',
        password: 'passwoівмімrd',
      })
      .expect(201);

    expect(response.body).toBeDefined();
  });
});

import { ElasticsearchService } from '@nestjs/elasticsearch';

export const mockElasticsearchService = {
  index: jest.fn(),
  search: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  bulk: jest.fn(),
};

export const MockElasticsearchService = {
  provide: ElasticsearchService,
  useValue: mockElasticsearchService,
};
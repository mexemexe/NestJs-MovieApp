import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MockElasticsearchService, mockElasticsearchService } from './elasticsearch.mock';

describe('Elasticsearch Mock', () => {
  let module: TestingModule;
  let elasticsearchService: ElasticsearchService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [MockElasticsearchService],
    }).compile();

    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  it('should create a mock Elasticsearch service', () => {
    expect(elasticsearchService).toBeDefined();
  });

  it('should have mock methods', () => {
    expect(elasticsearchService.index).toBeDefined();
    expect(elasticsearchService.search).toBeDefined();
    expect(elasticsearchService.update).toBeDefined();
    expect(elasticsearchService.delete).toBeDefined();
    expect(elasticsearchService.bulk).toBeDefined();
  });

  it('should allow mocking method calls', async () => {
    const mockSearchResult = { hits: { total: 1, hits: [] } };
    mockElasticsearchService.search.mockResolvedValue(mockSearchResult);

    const result = await elasticsearchService.search({});
    expect(result).toEqual(mockSearchResult);
    expect(mockElasticsearchService.search).toHaveBeenCalled();
  });
});
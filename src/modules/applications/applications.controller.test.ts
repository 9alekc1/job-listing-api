import { Request, Response, NextFunction } from 'express';
import * as applicationsService from './applications.service';
import { applyToJob, getMyApplications } from './applications.controller';

jest.mock('./applications.service');

const mockedService = applicationsService as jest.Mocked<typeof applicationsService>;

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    user: { id: 'user-1' },
    params: {},
    ...overrides,
  } as unknown as Request;
}

function makeRes(): { res: Response; json: jest.Mock; status: jest.Mock } {
  const json = jest.fn();
  const status = jest.fn().mockReturnThis();
  const res = { json, status } as unknown as Response;
  return { res, json, status };
}

const next = jest.fn() as jest.MockedFunction<NextFunction>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('applyToJob', () => {
  const mockApplication = {
    id: 'app-1',
    job_id: 'job-1',
    user_id: 'user-1',
    status: 'pending',
    applied_at: new Date('2026-01-01'),
  };

  it('responds 201 with the created application', async () => {
    mockedService.applyToJob.mockResolvedValue(mockApplication);
    const req = makeReq({ params: { id: 'job-1' } });
    const { res, json, status } = makeRes();

    await applyToJob(req, res, next);

    expect(mockedService.applyToJob).toHaveBeenCalledWith('user-1', 'job-1');
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ data: mockApplication });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with the error when the service throws', async () => {
    const error = { status: 404, message: 'Job not found or no longer open' };
    mockedService.applyToJob.mockRejectedValue(error);
    const req = makeReq({ params: { id: 'job-99' } });
    const { res } = makeRes();

    await applyToJob(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('calls next with a 409 error when already applied', async () => {
    const error = { status: 409, message: 'Already applied to this job' };
    mockedService.applyToJob.mockRejectedValue(error);
    const req = makeReq({ params: { id: 'job-1' } });
    const { res } = makeRes();

    await applyToJob(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('getMyApplications', () => {
  const mockApplications = [
    {
      id: 'app-1',
      job_id: 'job-1',
      user_id: 'user-1',
      status: 'pending',
      applied_at: new Date('2026-01-01'),
      title: 'Engineer',
      company: 'Acme',
    },
  ];

  it('responds 200 with the list of applications', async () => {
    mockedService.getMyApplications.mockResolvedValue(mockApplications);
    const req = makeReq();
    const { res, json, status } = makeRes();

    await getMyApplications(req, res, next);

    expect(mockedService.getMyApplications).toHaveBeenCalledWith('user-1');
    expect(status).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith({ data: mockApplications });
    expect(next).not.toHaveBeenCalled();
  });

  it('responds with an empty list when the user has no applications', async () => {
    mockedService.getMyApplications.mockResolvedValue([]);
    const req = makeReq();
    const { res, json } = makeRes();

    await getMyApplications(req, res, next);

    expect(json).toHaveBeenCalledWith({ data: [] });
  });

  it('calls next with the error when the service throws', async () => {
    const error = new Error('DB failure');
    mockedService.getMyApplications.mockRejectedValue(error);
    const req = makeReq();
    const { res } = makeRes();

    await getMyApplications(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

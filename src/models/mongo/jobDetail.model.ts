import { Schema, model } from 'mongoose';

interface IJobDetail {
  _id: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  perks: string[];
  techStack: string[];
  companyInfo: {
    website?: string;
    size?: string;
    industry?: string;
    logoUrl?: string;
  };
  applicationDeadline?: Date;
}

const jobDetailSchema = new Schema<IJobDetail>(
  {
    _id: { type: String },
    description: { type: String, required: true },
    requirements: [String],
    responsibilities: [String],
    perks: [String],
    techStack: [String],
    companyInfo: {
      website: String,
      size: String,
      industry: String,
      logoUrl: String,
    },
    applicationDeadline: Date,
  },
  { _id: false }
);

export const JobDetail = model<IJobDetail>('JobDetail', jobDetailSchema);

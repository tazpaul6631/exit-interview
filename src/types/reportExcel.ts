export interface LeaveReasonRow {
  organizationId: number;
  organizationName: string;
  reasonOne: number;
  reasonTwo: number;
  reasonThree: number;
  reasonFour: number;
  reasonFive: number;
}

export interface RatingRow {
  ratingTitle: string;
  ratingOne: number;
  ratingTwo: number;
  ratingThree: number;
  ratingFour: number;
  ratingFive: number;
}

export interface TextRow {
  interviewId: number;
  employeeName: string;
  answerOne: string;
  answerTwo: string;
  answerThree: string;
}

export interface ReportExcelResponse {
  leaveReasons: LeaveReasonRow[];
  ratings: RatingRow[];
  texts: TextRow[];
}

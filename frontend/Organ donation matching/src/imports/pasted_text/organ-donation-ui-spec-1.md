Design a modern, enterprise-grade healthcare web application UI for an AI-Powered Organ Donation Matching System.

IMPORTANT

This UI will be developed using React (JavaScript) with Vite.

DO NOT generate TypeScript-specific designs.

Generate reusable React-friendly screens and components instead of one large static dashboard.

The design should be production-quality and easy for React developers to convert into components.

--------------------------------------------------------

PROJECT TITLE

AI-Powered Organ Donation Matching System

Tagline

"Intelligent Organ Allocation and Transplant Decision Support"

--------------------------------------------------------

THEME

Modern Healthcare SaaS

Professional Hospital Dashboard

Clean Minimal Design

Desktop Responsive

Use Auto Layout

White Background

Blue Primary (#2563EB)

Light Gray Cards

Rounded Corners (12px)

Soft Shadows

Minimal Animations

Typography

Heading : Poppins

Body : Inter

Buttons : Inter Medium

Avoid colorful gradients.

--------------------------------------------------------

USER ROLES

The application contains ONLY TWO USER ROLES.

1. Hospital Administrator

2. Doctor

Do NOT create Donor Login.

Do NOT create Recipient Login.

Reason:

All donor and recipient records are verified and registered only by hospitals to maintain authenticity, prevent fake registrations, and comply with medical workflows.

--------------------------------------------------------

DESIGN SYSTEM

Create reusable React components.

Sidebar

Navbar

Dashboard Cards

Statistic Cards

Search Bar

Tables

Forms

Buttons

Input Fields

Dropdowns

Date Picker

Modal

Loading Screen

Toast Notification

Status Badge

Priority Badge

Recommendation Card

Compatibility Card

Prediction Card

Charts

Pagination

Empty State

Confirmation Dialog

Every component should be reusable.

Use consistent spacing.

Name every layer properly.

--------------------------------------------------------

PAGE 1

LOGIN

Hospital Logo

Application Name

AI-Powered Organ Donation Matching System

Tagline

Email

Password

Role Selector

Admin

Doctor

Remember Me

Forgot Password

Professional Login Button

--------------------------------------------------------

PAGE 2

ADMIN DASHBOARD

Sidebar

Dashboard

Register Donor

Register Recipient

Donor Database

Recipient Database

Analytics

Logout

Dashboard Cards

Total Donors

Total Recipients

Critical Recipients

Available Donors

Today's Matches

Recent Registrations

Charts

Monthly Registrations

Blood Group Distribution

Organ Availability

Recent Activities

--------------------------------------------------------

PAGE 3

REGISTER DONOR

Professional Form

Fields

Donor ID

Full Name

Age

Gender

Blood Group

Organ Available

Hospital

City

Doctor Verified

HLA Score

Organ Condition

Infection Status

Buttons

Save

Reset

Cancel

--------------------------------------------------------

PAGE 4

REGISTER RECIPIENT

Fields

Recipient ID

Full Name

Age

Gender

Blood Group

Required Organ

Urgency Level

Waiting Days

Hospital

City

HLA Score

Buttons

Save

Reset

Cancel

--------------------------------------------------------

PAGE 5

DONOR DATABASE

Professional searchable table.

Columns

Donor ID

Name

Blood Group

Organ

Hospital

Status

Doctor Verified

Actions

Search

Filter

Pagination

--------------------------------------------------------

PAGE 6

RECIPIENT DATABASE

Professional searchable table.

Columns

Recipient ID

Name

Required Organ

Urgency

Waiting Days

Hospital

Status

Actions

Search

Filter

Pagination

--------------------------------------------------------

PAGE 7

DOCTOR DASHBOARD

Sidebar

Dashboard

Find Matching Donor

Find Matching Recipient

AI Matching Queue

Recommended Match List

Prediction History

Reports

Logout

Dashboard Cards

Today's Predictions

Critical Cases

High Priority Matches

Average Compatibility Score

Available Donors

--------------------------------------------------------

AI MATCHING QUEUE

Display live AI recommendations.

Summary Cards

Pending Match Requests

Critical Priority Cases

High Compatibility Matches (>90%)

Available Organs Today

Successful Matches

Below the cards display a professional table.

Columns

Recipient ID

Required Organ

Urgency

Waiting Days

Top Matching Donor

Compatibility Score

AI Priority Score

Status

Actions

Status

Pending

Under Review

Approved

Rejected

Completed

Buttons

View Match

View Compatibility

Approve

Reject

--------------------------------------------------------

PAGE 8

FIND MATCHING DONOR

Doctor searches using Recipient ID.

Display recipient information.

Button

Find Matching Donors

Show ranked donor recommendations.

--------------------------------------------------------

PAGE 9

FIND MATCHING RECIPIENT

Doctor searches using Donor ID.

Display donor information.

Button

Find Matching Recipients

Show ranked recipient recommendations.

--------------------------------------------------------

PAGE 10

AI RECOMMENDED MATCH LIST

This is the PRIMARY FEATURE of the application.

Display AI-ranked donor-recipient recommendations.

Every recommendation card should include

Rank

Recipient ID

Donor ID

Compatibility Score

AI Priority Score

Medical Urgency

Waiting Days

Blood Compatibility

Organ Compatibility

HLA Match

Recommendation Status

Priority Badges

Critical (Red)

High (Orange)

Medium (Yellow)

Low (Green)

Buttons

View Compatibility

Approve Match

Reject Match

The top recommendation should be visually highlighted.

--------------------------------------------------------

COMPATIBILITY DETAILS

When clicking "View Compatibility"

Open a detailed panel.

Show

Overall AI Recommendation

Compatibility Score

AI Priority Score

Blood Compatibility

Organ Compatibility

HLA Match

Age Difference

Hospital Match

City Match

Waiting Time

Urgency

Doctor Verification

Organ Condition

Infection Status

Final Recommendation

Represent data using

Circular Progress

Progress Bars

Icons

Status Chips

Medical Cards

AI Recommendation Badge

--------------------------------------------------------

PAGE 11

PREDICTION HISTORY

Professional table.

Prediction ID

Doctor

Recipient

Donor

Prediction Date

Compatibility Score

Priority Score

Status

Search

Filters

Pagination

--------------------------------------------------------

PAGE 12

REPORTS

Analytics Dashboard

Prediction Reports

Download CSV

Download PDF

Doctor Filter

Date Filter

Summary Cards

--------------------------------------------------------

UI REQUIREMENTS

The interface should resemble enterprise hospital software.

Keep the design minimal.

Use reusable cards.

Use reusable forms.

Use reusable tables.

Maintain equal spacing.

Maintain consistent colors.

Follow healthcare UI standards.

--------------------------------------------------------

REACT REQUIREMENTS

Generate the UI as reusable React-friendly components.

Organize screens so React developers can directly convert them into:

Sidebar

Navbar

DashboardCard

StatsCard

SearchBar

DonorTable

RecipientTable

RecommendationCard

CompatibilityCard

PredictionTable

Forms

Buttons

Charts

Avoid giant merged screens.

Keep every page modular.

--------------------------------------------------------

PROJECT GOAL

The project focuses on Artificial Intelligence, Machine Learning, and MLOps.

The interface should emphasize intelligent decision support rather than simple CRUD operations.

The AI Matching Queue, Recommended Match List, Compatibility Details, and AI Priority Score should be the visual highlights of the application.

The design should inspire confidence, trust, professionalism, and clinical decision support similar to software used in real hospitals.
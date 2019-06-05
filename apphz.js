const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const app = express();
const events = [];

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.send('Hello World!!');
})

app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input EventInput{
        title: String!
        description: String!
        price: Float!
        date: String!
      }
      type Address {
        # List of values  are
        #
        # * Home Address
        # * Alternate Address
        # * Billing Address
        # * Temporary Address
        # * Primary Address   **future use**
        # * Permanent Address **future use**
        # * Contact Address   **future use**
        # * Mailing Address   **future use**
        # * ID Card Mailing Address  **future use**
        # * Correspondance and Mailing Address  **future use**
        # * Correspondance and Billing  **future use**
        # * Personal Representative Address  **future use**
        addressType: String!
        # First Line of the address
        addressLine1: String!
        # Second line of the address
        addressLine2: String
        # Third Line of the address
        addressLine3: String
        # City
        city: String!
        # County
        county: String
        # State
        state: String!
        # 9 digits of the zip code. Eg: - 07105-1443
        zipCode: String!
        # Country
        country: String
        # latitude tied to the coordinate of the address
        latitude: String!
        # longitude tied to the coordinate of the address
        longitude: String!
      }

      type AlternateId {
        # The identifier that is generated Federal or state or Private . Exchanges. This
        # value is sent to horizon as part of the enrollment.Additionally this element
        # is used as a member identification which represents the actual value of the
        # Medicaid Recipient ID.
        id: String!
        # Various Federal or state or Private Exchange Id types. Additionally this
        # element represents the type of Medicaid member identifier.
        #
        # Supported values are
        #
        # * FIX --> Federal Individual Exchange
        # * FSX --> Federal Shop Exchange
        # * MA --> Medicaid ‘Recipient’ Id
        idType: String!
        # This object is returned  ONLY in the POST /subscribers/search  response. Supported values  are
        # *  True -->  returned for idType or FIX and FSX  ONLY
        # * False --> future use
        hcrIndicator: Boolean!
      }

      # Amount structure
      type AmountInformation {
        # The maximum amount the health plan is contractually obligated to pay on a
        # claim/claim line before member and provider liability.
        allowedAmount: Float
        # The amount that the provider billed on the claim/claim line.
        chargeAmount: Float!
        # The amount of coinsurance that the patient is responsible for on this claim/claim line.
        coinsurance: Float
        # The amount of copay that the patient is responsible for on this claim/claim line.
        copay: Float
        # The amount of deductible that the patient is responsible for on this claim/claim line.
        deductible: Float
        # The amount that is not covered under a member's benefit on the claim/claim line.
        notCoveredAmount: Float
        # The amount that the patient is responsible for a claim.
        #
        # * Amounts are not currently returned on a claim line
        patientResponsibility: Float
        # The amount paid for the claim/claim line
        paidAmount: Float
        # The amount Medicare allowed on a claim line. This element currently not populated at the claim summary
        medicareAllowedAmount: String
        # The Medicare deductible amount on a claim/claim line.
        medicareDeductibleAmount: Float
        # The Medicare coinsurance amount on a claim/claim line.
        medicareCoinsuranceAmount: Float
        # The amount  Medicare paid on a claim/claim line.
        medicarePaidAmount: Float
        # The amount the other carrier allowed for a claim/claim line.
        otherCarrierAllowedAmount: Float
        # The amount the other carrier paid on a claim/claim line.
        otherCarrierPaidAmount: Float
      }

      # A single claim structure.  This could be a single iteration of a Claim.
      type Claim {
        # Unique identifier assigned to a specific Claim. This is a transient value
        claimId: String!
        # An internal control number assigned to each claim when it enters the claims processing application.
        claimNumber: String!
        # The iteration of the claim.  Examples
        # * "00" is first iteration of the claim
        # * "01" next iteration for MPL claims and backed out NASCO claim
        # * "02" adjusted claim  - for NASCO, MPL claim
        #
        # Note: data from NASCO and MPL are the only claim sources with iterations
        iteration: String!
        # For an MPL claim, a value of 1 indicates the original claim and a value of '4' reflects the backed out claim
        disposition: String
        # The earliest date that the services billed on this claim/claim line were performed. It is in ISO 8601 Format of yyyy-MM-dd
        firstDateOfService: String!
        # The last date that the services billed on this claim were performed.  It is in ISO 8601 Format of yyyy-MM-dd
        lastDateOfService: String!
        # The date claim was received or the date the claim was entered into the claim
        # processing application.  It is in ISO 8601 Format of yyyy-MM-dd
        receivedDate: String!
        # The date that the claim reached its current claim status code.  If it is
        # pended - the last date that it was pended.  If it is finalized - the date it
        # was finalized (ready to go to payment).  It is in ISO 8601 Format of yyyy-MM-dd
        processedDate: String!
        # Description of the processing status of the claim. Valid valules are Finlized and Pended
        status: String!
        amounts: AmountInformation!
        messages: Message
        patientInformation: PatientInformation!
        # Indicates how the claim was paid:
        # Valid values are:
        # In-Network
        # Out-of-Network
        networkIndicator: String
        billingProvider: Provider!
        # Further defines the type of health claim:
        # Values:
        # * Professional
        # * Institutional
        claimType: String!
        # Current Supported Values: Medical
        #
        # Future Supported Values: Vision Pharmacy Prescription Rx Mental Health
        lineOfBusiness: String!
        # An array of 1 or more payees on a claim
        payeesInformation: [PayeeInformation]
        # The UB92 standard three digit code on a claim that describes the type of bill
        # a provider is submitting to a payer.  Most of the time an inpatient claim has
        # a type of bill of 111.  Most of the time an outpatient claim has a type of bill 131.
        billType: String
        # The description associated with the UB92 standard field called Type of Bill
        billTypeDescription: String
        # Identifier of the EOB document number. Can be populated with a value of "EOB Not Found" if one is unavailable
        eobDocumentId: String
        # The  image number of the claim
        imageNumber: String
        # The examiner code populated on the claim
        examinerCode: String
        # Optional, currently this is only returned back when selecting a specific claim.
        claimLines: [ClaimLine]!
      }

      # single claim line structure
      type ClaimLine {
        # A number that uniquely identifies the service line on the claim.
        lineId: String!
        # The earliest date that the services billed on this claim were performed.  It is in ISO 8601 Format of yyyy-MM-dd
        firstDateOfService: String!
        # The last date that the services billed on this claim were performed.  It is in ISO 8601 Format of yyyy-MM-dd
        lastDateOfService: String!
        # Description of the processing status of the claim. Valid values are Finalized or Pended
        status: String!
        # The diagnosis code on the claim line
        diagnosisCode: String
        # The diagnosis description on the claim line
        diagnosisDescription: String
        # The description for the claim detail service type indicating the type of service that was rendered on the claim.
        procedureDescription: String
        # Code representing the placeOfService
        placeOfService: String
        # Description of placeOfService
        placeOfServiceDescription: String
        # The NUBC code submitted on the UB92/HCFA1450 claim service line that indicates the services provided to a patient.
        revenueCode: String
        # The short description associated with the Revenue code - a national standard code.
        revenueCodeDescription: String
        # The number of units billed on a service line.
        serviceUnitCount: Float
        messages: Message
        amounts: AmountInformation!
      }

      input ClaimSearchInput {
        # The unique member identifier associated with the claim. This is the transient value
        memberId: String
        # An internal control number assigned to a claim when it enters the claims processing application.
        claimNumber: String
        # The plan code allows for uniqueness of a claim number
        planCode: String
        # It is in ISO 8601 Format of yyyy-MM-dd. This date is inclusive.
        #
        # The claim service start date or end date should fall within the searchStartDate to searchEndDate range.
        #
        # The default is 18 months from current date
        searchStartDate: String
        # Default value if not passed in the request is current date.  It is in ISO 8601
        # Format of yyyy-MM-dd. This date is inclusive
        #
        # The claim service start date or end date should fall within the searchStartDate to searchEndDate range.
        searchEndDate: String
        # This is a filter to limit the claim response.
        #
        # Not passing a value in this element equates to all statuses returned in the response Valid codes are: Finalized Pended
        status: String
        # The checkNumber for a subscriber paid claim
        checkNumber: String
        # The page number within the data that is being requested. The default pageNumber is 1.
        pageNumber: Int
        # The size of the page(i.e, number of records) to be returned. The default pageSize is 10.
        pageSize: Int
        # Supports a single element SORT. The format will be a �-� for descending, and unsigned for ascending order.
        #
        # Supported fields are:
        # * claimNumber
        # * firstDateOfService
        # * lastDateOfService
        # * status
        # * providerName
        #
        # If a valid element is provided to the sort without indicating a sort order, ascending will be the default
        sort: String
        # A value that indicates who will receive payment for this claim. Values:
        #
        # * Provider
        # * Subscriber
        payeeType: String
      }

      # A single claim summary structure that reflects the latest iteration of the claim
      type ClaimSummary {
        # Identifier of a specific claim or a set of claims when claims are adjusted. This is a transient value.
        claimId: String!
        # An identifier for a Subscriber. Valid value is Customer Card ID (CCID)
        cardId: String!
        # An internal control number assigned to each claim when it enters the claims processing application.
        claimNumber: String!
        # The iteration of the claim. Examples
        #
        # * �00� is first iteration of the claim
        # * �01� next iteration for MPL claims and backed out NASCO claim
        # *  �02� adjusted claim - for NASCO, MPL claim
        #
        # Note: data from NASCO and MPL are the only claim sources with iterations
        iteration: String
        # The number that uniquely identifies an ITS claim. �The ITS claim number or SCCF number.
        sccfNo: String
        patientInformation: PatientInformation
        # The earliest date that the services billed on this claim/claim line were
        # performed.  It is in ISO 8601 Format of yyyy-MM-dd
        firstDateOfService: String!
        # The last date that the services billed on this claim were performed.  It is in ISO 8601 Format of yyyy-MM-dd
        lastDateOfService: String!
        # Current Supported Values: Medical
        #
        # Future Supported Values: Vision Pharmacy Prescription Rx Mental Health, Dental
        lineOfBusiness: String!
        # Description of the processing status of the claim. Valid values are Finalized and Pended
        status: String!
        # The date that the claim reached its current claim status code. If it is pended
        # - the last date that it was pended. If it is finalized - the date it was
        # finalized (ready to go to payment). It is in ISO 8601 Format of yyyy-MM-dd
        processedDate: String!
        billingProvider: Provider!
        amounts: AmountInformation!
        # Identifier of the EOB document number.
        eobDocumentId: String
        # A count of the number of claim iterations that exist
        numberOfClaimIterations: Int!
        # Claim messages.  Currently, it is only expected to have a single message per claim, however, this may grow in the future.
        messages: [Message]
        # A 3 character code for the Claim Location Code
        locationCode: String
        # Thee Claim ITS Location Date.
        locationDate: String
      }

      type Contact {
        # Unique contact identifier Note: This is a transient value
        contactId: String!
        # Unique subscriber identifier
        # Note: This is a transient value
        subscriberId: String
        # Customer card Id must be populated using the subscriber's customer card Id (CCID),
        # HNJH Member Id (HNJID), BCA ITS Subscriber Id (BCA_SUB_ID).
        #
        # *CCID - for FEP members it would be the "Rnnnnnnnn" number. MPL members  3
        # character alpha numeric prefix followed by "74nnnnnnn' or '3HZNnnnnnnnn'.
        #
        # *HNJID members 6-8 digits all numeric.
        #
        # *BCA_SUB_ID members max length of 17 alpha numeric. The first three positions
        # will contain the alpha prefix followed by up to 14 alpha numeric.
        cardId: String
        # This is a 7 alphanumberic element that defines the main group number. The
        # number could represent an NMS or NASCO group number and is left padded with
        # zeros to make a consistent 7 digit number
        mainGroupNumber: String
        # This is a 4 alphanumberic element that defines the subgroup number. The number
        # could represent an NMS subgroup or NASCO section number and is left padded
        # with zeros to make a consistent 4 digit number
        subGroupNumber: String
        # Relationship to the subscriber.
        #
        # Values:
        # * Self (this identifies the subscriber)
        # * Spouse
        # * Child
        # * Adult Dependent
        # * Class II or Sponsored
        # * Dependents over 30 not covered under Subscriber
        # *	Handicap Child
        # *	Life Partner
        # *	Other Relationship
        # *	Unknown
        relationship: String!
        # collection of members various address
        addresses: [Address]
        # collection of members various phones
        phones: [Phone]
        # collection of members various emails
        emails: [Email]
      }

      # A single coverage structure - returns both internal and authorizedMembers in addition to all of the coverage properties
      type Coverage {
        # Unique Coverage identifier Note: This is a transient value. It is necessary to make other API calls
        coverageId: String!
        subgroup: Subgroup!
        # Effective date of the coverage.  This date is inclusive.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        effectiveDate: String!
        # Termination date of the coverages. This date is inclusive, which means the member has coverage on this day.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        terminationDate: String!
        # The product id (often referred to as the coverage code).  This will be unique
        # for a given product for consumer and small group for a given time period,
        # however, is not unique for midsize and above.
        productId: String!
        # Product Line Id
        productLineId: String
        # Product Name
        productName: String!
        # Contract type.
        #
        # Values include:
        # * Single
        # * Family
        # * Subscriber Spouse
        # * Subscriber Children
        # * Domestic Partners
        # * Civil Union Partners
        # * Husband and Wife, one over 65, one under 65
        # * Full Family, one spouse over 65, one under 65
        contractType: String!
        # Relationship to the subscriber.
        #
        # Values:
        # * Self
        # * Spouse
        # * Child
        # * Adult Dependent
        # * Class II or Sponsored
        # * Dependents over 30 not covered under Subscriber
        # * Handicap Child
        # * Life Partner
        # * Other Relationship
        # * Unknown
        relationship: String!
        # An array of scope that the current requesting member has for this particular
        # member.  This could be empty or not returned if the requesting member does NOT
        # have any access to this particular member's data.  This is used when applying
        # the allowedAccess filter.
        #
        # Current scope:
        # * **SelfService** - such services as Member Portal.   This can be considered a default scope for member services
        # * **GetCare** - for such services as Pager and types of services that support the members care
        allowedAccess: [String]
        # Line of business.
        #
        # Values:
        # * Medical
        # * Dental
        # * Vision
        # *  Pharmacy Prescription Rx
        # *  Mental Health  (future use)
        lineOfBusiness: String!
        # Market Segment.
        #
        # Values:
        # * Individual
        # * Small
        # * Medicaid
        # * National
        # * Federal
        # * State
        # * Public
        # * Senior
        # * MidSize
        # * Jumbo
        # * Labor
        marketSegment: String!
        # Market Segment Code
        marketSegmentCode: String
        # Indicates level of Id Card.
        #  Values:
        # * member
        # * family
        idCardScope: String
        # Boolenan indicator if the product is a Medicare product
        medicareIndicator: Boolean!
        # Boolean indicator if the product is a Medigap product
        medigapIndicator: Boolean
        # Boolean indicator if this coverage is from the public exchange.  true (On Exchange),  false (Off Exchange)
        exchangeIndicator: Boolean!
        # Product metallic level:  Platinum, Gold, Silver, Bronze
        metallicProductType: String
        # Values for Product SubType
        #
        # * 0 - Non-Exchange variant
        # * 1 - Exchange variant (no CSR)
        # * 2 - Open to Indians below 300%FPL
        # * 3 - Open to Indians above 300%FPL
        # * 4 - 73% AV Level Silver Plan CSR
        # * 5 - 87% AV Level Silver Plan CSR
        # * 6 - 94% AV Level Silver Plan CSR
        metallicProductSubType: String
        # A collection of the primacy information of the coverage.  Often this will be a
        # single record, however, primacy can change over the life of the coverages, so
        # this will be returned as a collection.
        #
        # Note:  Primacy identifies when there are multiple coverages under a single
        # subscriber/cardId.   COB defines across multiple coverages that are under
        # different subscribers/cardIds or even different insurers.
        primacy: [Primacy]
        # A collection of Exchange alternate ids.
        alternateIds: [AlternateId]
        premium: Premium
        internal: Internal
        # Values: FSA, HSA, HRA
        #
        # **Not returned when filters=summary**
        #
        # **Note: this indicator signifies that member is eligible to avail the type of spending account listed
        accounts: [String]
        # Values for accountCategory
        #
        # * MyWay - Horizon managed CDHP account
        # * Compatible - Non-Horizon managed CDHP account
        #
        # **Not returned when filters=summary**
        accountCategory: String
        # Employment Type
        employmentType: [EmploymentType]
      }

      # A coverage structure used for searching
      input CoverageSearchInput {
        # CCID - for most member
        # FEP members it would be the "Rnnnnnnnn" number
        # MPL members it would be the 3 character alpha numeric prefix followed by "74nnnnnnn'
        # Internally this can also be used for HorizonId or subscribers SSN
        cardId: String
        # Filter to a specific subscriber by subscriberId. This is a transient Id.
        subscriberId: String
        subgroup: SubgroupSearchInput
        # Line of business.
        #
        # Values:
        # * Medical
        # * Dental
        # * Vision
        # *  Pharmacy Prescription Rx
        # *  Mental Health  (future use)
        lineOfBusiness: String
        # The start date to be used to find coverage.
        # * If neither searchStartDate or searchEndDate are supplied, then all coverages will be returned.
        # * If not supplied, all coverages less than or equal to the searchEndDate will be returned.
        # * If both are supplied, any coverage that is active in any portion of the
        # searchStartDate to searchEndDate range will be returned.
        # * If a single date of service is to be looked up, the searchStartDate and searchEndDate should be set to the same date.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        searchStartDate: String
        # The end date to be used to find coverage.
        # * If neither searchStartDate or searchEndDate are supplied, then all coverages will be returned.
        # * If not supplied, all coverages greater than or equal to the searchStartDate will be returned.
        # * If both are supplied, any coverage that is active in any portion of the
        # searchStartDate to searchEndDate range will be returned.
        # * If a single date of service is to be looked up, the searchStartDate and searchEndDate should be set to the same date.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        searchEndDate: String
        # Comma separated list of scope that the response should be filtered to.  Current values include:
        #
        # * **SelfService** - such services as Member Portal.   This can be considered a default scope for member services
        # * **GetCare** - for such services as Pager and types of services that support the members care
        allowedAccess: String
        # * **includeFSA** - returns additional FSA coverage details
        sections: String
      }

      # various email address
      type Email {
        # List of values  are
        #
        # * Home Email Address
        # * Primary Email Address
        # * Email Address for Enrollment **future use**
        emailType: String
        email: String
        # HORIZON_MP / PAYFONE / or any other source. Caller must provide this value.
        sourceName: String
      }

      type EmploymentType {
        # Values:
        #
        # * Employed
        # * Cobra
        # * Retiree
        employmentType: String
        # Effective Date
        #
        # Format: ISO 8601 date in the format yyyy-MM-dd
        effectiveDate: String
        # End Date
        #
        # Format: ISO 8601 date in the format yyyy-MM-dd
        endDate: String
      }

      type FederalExchangeIndicators {
        # Indicator if the member is an American Indian.  Required for different exchange plans.
        americanIndian: Boolean!
        # Indicator if the member is an Alaskan Native.  Required for different exchange plans.
        alaskanNative: Boolean!
      }

      # A single internal section structure
      type Internal {
        # **Internal Only:** Horizon Id of the subscriber
        #
        # **Populated only when memberId is received in the URL**
        horizonId: String
        # **Internal Only:** Route code of the particular coverage.  This is NOT the
        # high-level single route code, but one that is specific to the coverage.
        routeCode: String!
        # **Internal Only:** Indicates the Claim System that administers the contract.
        #
        # Valid values are: ACE BCL ERI HNC HNN HIS HSQ LAT NAS NQH QHS QMA TPA.
        claimProcessingSystemCode: String
        # **Internal Only:** MEMNMS, MEMNAS, MEMMED, MEMNJH
        enrollmentSourceSystem: String!
        # **Internal Only:** CCID plus extent.  Used by 820 transaction for billing.
        ccidPlusNascoExt: String
        # **Internal Only:** A code indicating the action which was taken to create or
        # change the Subscriber's product (add or change) and the reason why the action was taken
        prdChangeReasonCd: String
        # **Internal Only:** A code specifying the type of person for whom 'rider'
        # claims, under the product, should be rejected for manual adjudication because
        # of pre-existing health condition. Valid values:
        # * 0 - Pre-X applies to Subscriber
        # * 1 - Pre-X applies to Subscriber and Spouse
        # * 2 - Pre-X applies to Spouse and Children
        # * 3 - Pre-X applies to Subscriber, Spouse and Children
        # * 4 - Pre-X applies to Subscriber and Children
        # * 5 - Pre-X waived for Subscriber
        # * 6 - Pre-X waived for Subscriber and Spouse
        # * 7 - Pre-X waived for Spouse and Children
        # * 8 - Pre-X waived for Subscriber, Spouse and Children
        # * 9 - Pre-X waived for Subscriber and Children
        preXCondCd: String
        # **Internal Only:** The date as of which a Subscriber needs no longer wait for
        # claims to be paid for claims resulting from a Pre-Existing condition.
        waitPrdEndDt: String
      }

      type Link {
        href: String
        rel: String
      }

      # A single member record
      type Member {
        # Member Id. Unique Member identifier. Note: This is a transient value
        #   This is needed to call other APIs
        memberId: String!
        # An array of scope that the current requesting member has for this particular
        # member.  This could be empty or not returned if the requesting member does NOT
        # have any access to this particular member's data.  This is used when applying
        # the allowedAccess filter.
        #
        # **Note:** This will only be returned when the X-HZN-RequestingMemberId is
        # passed in (i.e. it is only returned when the request is made with context of a
        # specific member).
        #
        # Current scopes include:
        # * **SelfService** - such services as Member Portal.   This can be considered a default scope for member services
        # * **GetCare** - for such services as Pager and types of services that support the members care
        allowedAccess: [String]
        # **Internal Only:** MDM Original GUID generated by MDM .Its unique at an individual level .
        personId: String!
        # Member name prefix
        prefix: String
        # Member's first name
        firstName: String
        # Member's middle name
        middleName: String
        # Member's last name
        lastName: String
        # Member name suffix
        suffix: String
        # Member's Date of Birth. Format  ISO 8601 date in the format yyyy-MM-dd
        dob: String!
        # Member's gender.
        #
        # Values:
        # * Female
        # * Male
        # * Ambiguous
        # * Not Applicable
        # * Other
        # * Unknown
        #
        # Note: The API will handle Gender filtration for Male and Female only
        gender: String!
        # **Internal Only:** Member's SSN.   Format nnnnnnnnn.
        ssn: String
        # Indicates if Member is a Horizon employee. Will only be returned when True.
        horizonEmployeeIndicator: Boolean
        federalExchangeIndicators: FederalExchangeIndicators
        # Relationship to the subscriber.
        #
        # Values:
        # * Self    (this identifies the subscriber)
        # * Spouse
        # * Child
        # * Adult Dependent
        # * Class II or Sponsored
        # * Dependents over 30 not covered under Subscriber
        # * Handicap Child
        # * Life Partner
        # * Other Relationship
        # * Unknown
        relationship: String
        # Date that dependent relationship became effective
        effectiveDate: String
        # Date that dependent relationship termed
        endDate: String
        contacts: [Contact]
        coverages: [Coverage]
      }

      # Input for a member search.
      # Conditional search of memberId or firstName, lastName and dob are the minimum search parameters
      input MemberSearchInput {
        # Member's unique identifier.   MDM Original GUID generated by MDM .Its unique at an individual level .
        #
        #
        # Conditional search of personId or firstName, lastName and dob are the minimum search parameters
        personId: String
        # Member's first name - Exact match or wildcard search.
        #
        # Conditional search of personId or firstName, lastName and dob are the minimum
        # search parameters. For wildcard search client will pass name with wildcard
        # '%'. Wildcard search only happen when client pass wildcard end of string.
        # Wildcard search must have at least a 1 character limit before the ‘%’ for a
        # wild card search.
        firstName: String
        # Member's middle name.
        # This will be a wildcard search so that a single letter can be sent in to match a middle inital or full middle name.
        middleName: String
        # Member's last name - Exact match or wildcard search.
        #
        # Conditional search of personId or firstName, lastName and dob are the minimum search parameters.
        #
        # For wildcard search client will pass name with wildcard '%'. Wildcard search
        # only happen when client pass wildcard end of string. Wildcard search must have
        # at least a 1 character limit before the ‘%’ for a wild card search.
        lastName: String
        # Member's Date of Birth - exact match.
        #
        # **Format ISO 8601 date in the format yyyy-MM-dd**
        #
        # Conditional search of memberId or firstName, lastName and dob are the minimum search parameters
        dob: String
        # Member's ssn.   Format nnnnnnnnn.
        ssn: String
        # Member's gender.
        #
        # Values:
        # * Female
        # * Male
        # * Ambiguous
        # * Not Applicable
        # * Other
        # * Unknown
        gender: String
      }

      # message structure
      type Message {
        # A description of the Message Code indicating how or why the claim was paid/denied/pended.
        message: String!
        # An internal code assigned by the claims processing application that identifies
        # how or why the claim was paid/denied/pended.
        messageCode: String!
      }

      type RootMutation {
        root: String
        createEvent(eventInput: EventInput): Event
      }

      type PaginationResponse {
        # PageNumber that was requested
        pageNumber: Int!
        # PageSize that was requested
        pageSize: Int!
        # For services that request it, this is the total number of records that are available.
        totalRecords: Int!
      }

      # The patient's information returned in the claim response
      type PatientInformation {
        # Unique Member identifier. This element is not returned for patients where
        # Horizon does not hold the eligibility (FEP and Blue Card Members)
        memberId: String
        # The account number used by the provider to identify the patient listed on the claim.
        patientAccountNumber: String
        # The patient�s first name as submitted on the claim.
        firstName: String
        # The patient�s last name as submitted on the claim.
        lastName: String
        # The patient�s date of birth as submitted on the claim. It is in ISO 8601 Format of yyyy-MM-dd.
        dob: String
        # The patient's gender on the claim
        gender: String
      }

      # The payee payment information on the claim.
      type PayeeInformation {
        # The estimated date the check will be paid
        estimatedCheckDate: String
        # The date on the check that is associated with the claim. It is in ISO 8601 Format of yyyy-MM-dd.
        checkDate: String
        # The check number associated with the claim.
        checkNumber: String
        # This field identifies the entity which receives payment for the claim, the provider or the subscriber.
        payeeName: String
        # A value that indicates who will receive payment for this claim. Values:
        # * Provider
        # * Subscriber
        payeeType: String
        # This is the amount paid on the check. When a check is issued for multiple
        # claims, the check amount may different than the amount paid on a claim.
        checkAmount: Float
        # The status of the payment
        paymentStatus: String
        # A value that indicates whether the claim was paid via ACH or check
        checkOrACHIndicator: String
      }

      # various phone numbers
      type Phone {
        # List of values  are
        #
        # * Home Phone
        # * Alternate Phone
        # * Billing Phone
        # * Temporary Phone
        # * Primary Phone **future use**
        # * Work Phone    **future use**
        phoneType: String
        # Phone number format xx-xxx-xxx-xxxx,  international code could be prefixed if available in the backend.
        phoneNumber: String
        phoneExtension: String
        # HORIZON_MP / PAYFONE / or any other source. Caller must provide this value
        sourceName: String
      }

      type Premium {
        # Premium payment account number.  This can be on exchange or off exchange.
        accountNumber: String
        subsidy: PremiumSubsidy
      }

      # A single premium subsidy structure
      type PremiumSubsidy {
        # Cost sharing reduction indicator.
        costSharingReductionIndicator: String
        # Dollar amount of the subsidy
        amount: Float
        # Effective date of the subsidy
        #
        # **Format: yyyy-MM-dd**
        effectiveDate: String
        # Term date of the subsidy
        #
        # **Format: yyyy-MM-dd**
        termDate: String
      }

      # A single primacy structure
      type Primacy {
        # Primacy Indicator.  Values: Primary, Secondary, Tertiary, or Other
        primacyIndicator: String!
        # The effective date of the Primacy Indicator.  The date is inclusive.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        primacyEffectiveDate: String!
        # The termination date of the Primacy Indicator.  The date is exclusive.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        primacyTerminationDate: String!
      }

      # provider structure on the claim response
      type Provider {
        # The Provider ID submitted on the claim.
        providerId: String
        # The name of the Group Provider on the claim.
        providerName: String
        # The NPI of the provider on the claim
        providerNPI: String
      }

      type ProviderAddress {
        # Default is Service Location
        addressType: String
        # Line 1 of the address
        address1: String
        # Line 2 of the address
        address2: String
        # The city Name
        city: String
        # The 2 character state code
        state: String
        # The zip code of the address
        zipCode: String
      }

      type RootQuery {
        root: String
        events: [Event!]!
        member(memberId: String!): Member
        members(body: MemberSearchInput!): ResponseMembers
        contacts(memberId: String!): [Contact]!
        subscriber(subscriberId: String!): Subscriber
        # * **Purpose**: To retrieve a subscriber and dependent detailed level
        # information, including an indicator of which members they are allowed access to.
        # * **Prerequisite**: None
        # * **Validation**: Valid search input, either cardId or horizonId needs to be sent in.
        # * **Design Pattern**: Synchronous
        # * **Output**: subscriber
        # * **Error Notification**: Various http errors and faults.
        #
        # If no records match the search input, a http 200 will be returned with an empty subscriber structure
        subscriberSearch(body: SubscriberDetailsSearchInput!): Subscriber
        # * **Purpose**: To retrieve a specific claim, optionally with the various iterations
        # * **Prerequisite**: subscriberID, claimId
        # * **Validation**: Valid subscriberId, claimId
        # * **Design Pattern:** Synchronous
        # * **Output**: Claim details, optionally with the various iterations
        # * **Error Notification**: Various http errors and faults.
        claim(
          subscriberId: String!
          claimId: String!
          iteration: String
          pageNumber: Int
          pageSize: Int
        ): ResponseClaims
        # * **Purpose:** To retrieve a collection of claims for a subscriber family at a
        # summary level. If no records match the search input, a http 200 will be
        # returned with an empty claim collection. A post is used when PHI is sent, for
        # example a claimNumber is PHI.
        # * **Prerequisite:** subscriberId
        # * **Validation**: Valid subscriberId
        # * **Design Pattern:** Synchronous
        # * **Output:** Summary Claim Listing
        # * **Error Notification:** Various http errors and faults.
        claimSummarySearch(
          subscriberId: String!
          body: ClaimSearchInput!
        ): ResponseClaimsSummary
        # * **Purpose:** To retrieve a a collection of claims for the subscriber family
        # at a summary level. If no records match the search input, a http 200 will be
        # returned with an empty claim collection.
        # * **Prerequisite:** subscriberId
        # * **Validation:** Valid subscriberId
        # * **Design Pattern:** Synchronous
        # * **Output**: Summary Claim Listing
        # * **Error Notification:** Various http errors and faults.
        claimSummary(
          subscriberId: String!
          memberId: String
          searchStartDate: String
          searchEndDate: String
          status: String
          pageNumber: Int
          pageSize: Int
          sort: String
          planCode: String
          checkNumber: String
          payeeType: String
        ): ResponseClaimsSummary
      }

      type ResponseClaims {
        # Unique memberIdentifier.  This is a transient value
        memberId: String!
        # Collection of claims, this could be multiple if multiple iterations of the claim exists.
        claims: [Claim]!
        paginationResponse: PaginationResponse!
      }

      type ResponseClaimsSummary {
        # Unique identifier of a subscriber
        subscriberId: String
        # A list of claims.
        # NOTE: This can be an empty list if the critieria resulted in no claims found
        claimsSummary: [ClaimSummary]
        paginationResponse: PaginationResponse!
      }

      # A single coverage structure with authorized members and internal properties.
      type ResponseCoverage {
        # Unique Member identifier Note: This is a transient value
        memberId: String!
        coverage: Coverage!
      }

      # A response structure for a member search.
      type ResponseMembers {
        # A list of members
        members: [Member]
        # A list of links
        links: [Link]
      }

      # A single subgroup structure
      type Subgroup {
        # Subgroup name
        subGroupName: String!
        # This is a 7 alphanumberic element that defines the main group number.  The
        # number could represent an NMS or NASCO group number and is left padded with
        # zeros to make a consistent 7 digit number
        mainGroupNumber: String!
        # This is a 4 alphanumberic element that defines the subgroup number.  The
        # number could represent an NMS subgroup or NASCO section number and is left
        # padded with zeros to make a consistent 4 digit number
        subGroupNumber: String!
        # This is a 3 alphanumeric that defines a NASCO package code.  Although at this
        # time, it should be all numeric, alphas will be allowed for future support.
        packageCode: String
      }

      # A subgroup structure used for searching
      input SubgroupSearchInput {
        # This is a 7 alphanumberic element that defines the main group number.  The
        # number could represent an NMS or NASCO group number and is left padded with
        # zeros to make a consistent 7 digit number
        mainGroupNumber: String
        # This is a 4 alphanumberic element that defines the subgroup number.  The
        # number could represent an NMS subgroup or NASCO section number and is left
        # padded with zeros to make a consistent 4 digit number
        subGroupNumber: String
        # This is a 3 alphanumeric that defines a NASCO package code.  Although at this
        # time, it should be all numeric, alphas will be allowed for future support.
        packageCode: String
      }

      # A single subscriber record
      type Subscriber {
        # Unique member identifier of the requesting member.  The allowAccess indicators
        # are based upon if this member has access to the returned members.
        #
        # **Note:** This is a transient value and should not be saved
        requestingMemberId: String
        # Unique subscriber identifier. This is needed to call other APIs
        #
        # **Note:** This is a transient value and should not be saved
        subscriberId: String!
        # CCID - for most member
        # FEP members it would be the "Rnnnnnnnn" number
        # MPL members it woudl be the 3 character alpha prefix followed by "74nnnnnnn'
        # HNJH member ID – format 6-8 digits all numeric
        # Non-Horizon members - BCA_SUB_ID (ITS Subscriber ID) max length of 17 alpha
        # numeric. The first three positions will contain the alpha prefix followed by
        # up to 14 alpha numeric
        cardId: String!
        # **Internal Only:** Horizon Id of the subscriber
        horizonId: String!
        # **Internal Only:** Subscriber's SSN.   Format nnnnnnnnn.
        ssn: String
        # Exchange Id or other alternate ids
        alternateIds: [AlternateId]
        # Subscriber's name prefix
        #
        # **Not returned when filters=idsOnly**
        prefix: String
        # Subscriber's first name
        #
        # **Not returned when filters=idsOnly**
        firstName: String!
        # Subscriber's middle name
        #
        # **Not returned when filters=idsOnly**
        middleName: String
        # Subscriber's last name
        #
        # **Not returned when filters=idsOnly**
        lastName: String!
        # Member name suffix
        #
        # **Not returned when filters=idsOnly**
        suffix: String
        # Subscriber's Date of Birth. Format yyyy-MM-dd
        #
        # **Not returned when filters=idsOnly**
        dob: String!
        # A collection of members under this subscriber.  The subscriber will also have a record under this collection.
        #
        # Should always have at least a single record for the subscriber record.
        members: [Member]!
        # Indicates  the match result. This is only applicable  when matchType EXACT or
        # BEST received on the request (for /subscribers/search)
        #
        # When matchType **EXACT** received on request
        # * SubscriberId found, Exact Match Failed
        # * Successful match
        #
        # When matchType  **BEST** received on request
        # * Partial Match on dob
        # * Partial Match on firstName
        # * Subscriber not found
        # * Multiple Matching Members, Best Match Failed
        # * SubscriberId Found, Best Match Failed
        # * Partial Match on firstName and lastName
        # * Successful match
        typeOfMatch: String
        contacts: [Contact]
        coverages: [Coverage]
      }

      # A single coverage structure - returns both internal and authorizedMembers in addition to all of the coverage properties
      type SubscriberCoverage {
        # Unique Coverage identifier Note: This is a transient value. It is necessary to make other API calls
        coverageId: String!
        # The contract alpha prefix associated with the given coverage.
        alphaPrefix: String
        subgroup: Subgroup!
        # Effective date of the coverage.  This date is inclusive.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        effectiveDate: String!
        # Termination date of the coverages. This date is inclusive, which means the member has coverage on this day.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        terminationDate: String!
        # The product id (often referred to as the coverage code).  This will be unique
        # for a given product for consumer and small group for a given time period,
        # however, is not unique for midsize and above.
        productId: String!
        # Product Line Id
        #
        # **Not returned when filters=summary**
        productLineId: String
        # Product Name
        productName: String!
        # Contract type.
        #
        # Values include:
        # * Single
        # * Family
        # * Subscriber Spouse
        # * Subscriber Children
        # * Domestic Partners
        # * Civil Union Partners
        # * Husband and Wife, one over 65, one under 65
        # * Full Family, one spouse over 65, one under 65
        contractType: String!
        # Indicates the Claim System that administers the contract.
        #
        # Valid values are: ACE BCL ERI HNC HNN HIS HSQ LAT NAS NQH QHS QMA TPA.
        claimProcessingSystemCode: String
        # Line of business.
        #
        # Values:
        # * Medical
        # * Dental
        # * Vision
        # *  Pharmacy Prescription Rx
        # *  Mental Health  (future use)
        lineOfBusiness: String!
        # Market Segment.
        #
        # **Not returned when filters=summary**
        #
        # Values:
        # * Individual
        # * Small
        # * Medicaid
        # * National
        # * Federal
        # * State
        # * Public
        # * Senior
        # * MidSize
        # * Jumbo
        # * Labor
        marketSegment: String!
        # Market Segment Code
        #
        # **Not returned when filters=summary**
        marketSegmentCode: String
        # Indicates level of Id Card.
        #  Values:
        # * member
        # * family
        #
        # **Not returned when filters=summary**
        idCardScope: String
        # Boolenan indicator if the product is a Medicare product
        #
        # **Not returned when filters=summary**
        medicareIndicator: Boolean!
        # Boolean indicator if the product is a Medigap product
        #
        # **Not returned when filters=summary**
        medigapIndicator: Boolean
        # Boolean indicator if this coverage is from the public exchange.  true (On Exchange),  false (Off Exchange)
        #
        # **Not returned when filters=summary**
        exchangeIndicator: Boolean!
        # Product metallic level:  Platinum, Gold, Silver, Bronze
        #
        # **Not returned when filters=summary**
        metallicProductType: String
        # Values for Product SubType
        #
        # * 0 - Non-Exchange variant
        # * 1 - Exchange variant (no CSR)
        # * 2 - Open to Indians below 300%FPL
        # * 3 - Open to Indians above 300%FPL
        # * 4 - 73% AV Level Silver Plan CSR
        # * 5 - 87% AV Level Silver Plan CSR
        # * 6 - 94% AV Level Silver Plan CSR
        #
        # **Not returned when filters=summary**
        metallicProductSubType: String
        # A collection of the primacy information of the coverage.  Often this will be a
        # single record, however, primacy can change over the life of the coverages, so
        # this will be returned as a collection.
        #
        # **Not returned when filters=summary**
        #
        # Note:  Primacy identifies when there are multiple coverages under a single
        # subscriber/cardId.   COB defines across multiple coverages that are under
        # different subscribers/cardIds or even different insurers.
        primacy: [Primacy]
        # A collection of Exchange alternate ids.
        #
        # **Not returned when filters=summary**
        alternateIds: [AlternateId]
        premium: Premium
        internal: Internal
        # Values: FSA, HSA, HRA
        #
        # **Not returned when filters=summary**
        #
        # **Note: this indicator signifies that member is eligible to avail the type of spending account listed
        accounts: [String]
        # Values for accountCategory
        #
        # * MyWay - Horizon managed CDHP account
        # * Compatible - Non-Horizon managed CDHP account
        #
        # **Not returned when filters=summary**
        accountCategory: String
        # Employment Type
        employmentType: [EmploymentType]
      }

      # Input for a subscribers/coverage search
      input SubscriberCoverageSearchInput {
        # * CCID - for most members or MPL members it would be the 3 character alpha
        # numeric prefix followed by "74nnnnnnn’ or '3HZNnnnnnnnn'.
        #
        #
        # * **Note : Either of cardId or horizonId should be passed**
        cardId: String
        # Horizon Id of the subscriber
        # * **Note : Either of cardId or horizonId should be passed**
        horizonId: String
        # Member's first name.
        firstName: String
        # Member's middle name.
        middleName: String
        # Member's last name.
        lastName: String
        # Member's Date of Birth.
        #
        # **Format: yyyy-MM-dd**
        dob: String
        # Member's gender.
        #
        # Values:
        # * Female
        # * Male
        # * Ambiguous
        # * Not Applicable
        # * Other
        # * Unknown
        gender: String
        # Relationship to the subscriber.
        #
        # Values:
        # * Self    (this identifies the subscriber)
        # * Dependents (all members except subscriber)
        # * Spouse
        # * Child
        # * Adult Dependent
        # * Class II or Sponsored
        # * Dependents over 30 not covered under Subscriber
        # * Handicap Child
        # * Life Partner
        # * Other Relationship
        # * Unknown
        relationship: String
        # Comma separated list of scope that the response should be filtered to.  Current values include:
        #
        # * **SelfService** - such services as Member Portal.   This can be considered a default scope for member services
        # * **GetCare** - for such services as Pager and types of services that support the members care
        allowedAccess: String
        # The start date to be used to find coverage.
        # * If neither searchStartDate or searchEndDate are supplied, then all coverages will be returned.
        # * If not supplied, all coverages less than or equal to the searchEndDate will be returned.
        # * If both are supplied, any coverage that is active in any portion of the
        # searchStartDate to searchEndDate range will be returned.
        # * If a single date of service is to be looked up, the searchStartDate and searchEndDate should be set to the same date.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        searchStartDate: String
        # The end date to be used to find coverage.
        # * If neither searchStartDate or searchEndDate are supplied, then all coverages will be returned.
        # * If not supplied, all coverages greater than or equal to the searchStartDate will be returned.
        # * If both are supplied, any coverage that is active in any portion of the
        # searchStartDate to searchEndDate range will be returned.
        # * If a single date of service is to be looked up, the searchStartDate and searchEndDate should be set to the same date.
        #
        # **Format: ISO 8601 date in the format yyyy-MM-dd**
        searchEndDate: String
        # Line of business.
        #
        # Values:
        # * Medical
        # * Dental
        # * Vision
        # *  Pharmacy Prescription Rx
        # *  Mental Health  (future use)
        lineOfBusiness: String
        subgroup: SubgroupSearchInput
        # EXACT indicates that an exact match is requested using all submitted search
        # criteria. BEST indicates that the best single match is requested. Business
        # logic applies in selecting the BEST match. firtstName, lastName wildCard
        # search is supported only for EXACT matchType.
        matchType: String
        # Comma separated list of available filters.  The current filters are:
        # * **summary** - returns a minimal set of data, mainly made up of the name, ids, relationship and contract
        filters: String
        # Comma separated list of available sections.  The current sections are:
        # * **routecode** - returns  the route code and processing system details
        # * **teamdetails** - returns the vdn details from RCOE.
        # * **includeFSA** - returns additional FSA coverage details
        sections: String
      }

      # Input for a subscriber search.
      # Either cardId or horizonId needs to be sent in.
      input SubscriberDetailsSearchInput {
        # Subscriber Id Unique Subscriber identifier Note: This is a transient value.
        #
        # **Either the subscriberId, cardId or horizonId  needs to be sent in.**
        subscriberId: String
        # CCID - for FEP members it would be the "Rnnnnnnnn" number.
        # MPL members  3 character alpha numeric prefix followed by "74nnnnnnn' or '3HZNnnnnnnnn'
        #
        # **Either the subscriberId, cardId or horizonId needs to be sent in.**
        cardId: String
        # Various ID types.
        #
        # Supported values are
        #
        # * CCID --> Customer Card Id
        # * SUBSID --> BCBSNJ Subscriber Id
        # * HNJID --> HNJH Horizon NJ Health Member Id
        # * MA --> Medicaid ‘Recipient’ Id
        # * BCA_SUB_ID --> Non-Horizon Blue Card ITS Subscriber Id
        # * ATT_SUBSID --> Attributed ITS Subscriber ID
        # * ALL --> All of the above ID types
        cardIdType: String
        # Internal Horizon Id, ssn of the subscriber  or alternateId  value can be passed
        #
        #
        # **Either the subscriberId, cardId or horizonId  needs to be sent in.**
        horizonId: String
        # **Internal Only:** Used to filter the results down to a single personId.
        # **Note:**  If the requesting members does not have the allowedAccess scope
        # that is set in the allowedAccess input parameter, then these members will be
        # filtered out even if they match other criteria.
        personId: String
        # Used to filter to a particular member record.  This id is an unique Member
        # identifier This is a transient value This is needed to call other APIs.
        # **Note:**  If the requesting members does not have the allowedAccess scope
        # that is set in the allowedAccess input parameter, then these members will be
        # filtered out even if they match other criteria.
        memberId: String
        # Member's first name.   Used to filter the data to members with this first
        # name.  '%' can be used to perform wildcard search when preceded by at least 1 character.
        #
        # **Note:** If the requesting member does not have access to this member AND if
        # the filters=allowedAccess is set, even this member will be filtered out.
        firstName: String
        # Member's middle name.   Used to filter the data to members with this middle name.
        #
        # **Note:**  If the requesting members does not have the allowedAccess scope
        # that is set in the allowedAccess input parameter, then these members will be
        # filtered out even if they match other criteria.
        middleName: String
        # Member's last name.   Used to filter the data to members with this last name.
        # '%' can be used to perform wildcard search when preceded by at least 1 character.
        #
        #
        # **Note:**  If the requesting members does not have the allowedAccess scope
        # that is set in the allowedAccess input parameter, then these members will be
        # filtered out even if they match other criteria.
        lastName: String
        # Member's date of birth.   Used to filter the data to members with this date of birth
        #
        # **Format**: yyyy-MM-dd
        #
        # **Note:**  If the requesting members does not have the allowedAccess scope
        # that is set in the allowedAccess input parameter, then these members will be
        # filtered out even if they match other criteria.
        dob: String
        # Member's gender.   Used to filter the data to members with this gender.
        #
        # Values:
        # * Female
        # * Male
        # * Ambiguous
        # * Not Applicable
        # * Other
        # * Unknown
        #
        # **Note:**  If the requesting members does not have the allowedAccess scope
        # that is set in the allowedAccess input parameter, then these members will be
        # filtered out even if they match other criteria.
        gender: String
        # The start date to be used to filter dependents. Default Current Date - 24
        # Months. Must not be greater than searchEndDate.
        # *	If neither searchStartDate or searchEndDate are supplied, then all
        # dependents  matching the other search criteria  will be returned.
        # *	If searchStartDate not supplied, dependents active prior to and including
        # the searchEndDate matching the other search criteria  will be returned.
        # *	If both are supplied, dependent active in any portion of the searchStartDate
        # to searchEndDate range matching the other search criteria  will be returned.
        # *	If a single date is to be looked up, the searchStartDate and searchEndDate should be set to the same date.
        #
        # **Format:** ISO 8601 date in the format yyyy-MM-dd
        searchStartDate: String
        # The end date to be used to filter dependents. Default Current Date  + 6 months.
        #
        # *	If neither searchStartDate or searchEndDate are supplied, then all
        # dependents matching the other search criteria will be returned.
        # *	If searchEndDate not supplied, dependents active after and including the
        # searchStartDate matching the other search criteria  will be returned.
        # *	If both are supplied, dependents active in any portion of the
        # searchStartDate to searchEndDate range matching the other search criteria will be returned.
        # *	If a single date of service is to be looked up, the searchStartDate and searchEndDate should be set to the same date.
        #
        # **Format:** ISO 8601 date in the format yyyy-MM-dd
        searchEndDate: String
        # Comma separated list of scope that the response should be filtered to.  Current values include:
        #
        # * **SelfService** - such services as Member Portal.   This can be considered a default scope for member services
        # * **GetCare** - for such services as Pager and types of services that support the members care
        allowedAccess: String
        # Comma separated list of available filters.  The only current filter is:
        # * **idsOnly** - returns a minimal set of data, mainly made up of the ids and relationship
        filters: String
        # EXACT indicates that an exact match is requested using all submitted search
        # criteria. BEST indicates that the best single match is requested. Business
        # logic applies in selecting the BEST match.If not populated assume BEST.
        # firtstName, lastName wildCard search is supported only for EXACT matchType.
        matchType: String
        # Values 'Subscriber' , 'Dependent', or blank (both)
        memberRole: String
      }

      type TeamVdn {
        # The name of the Business Team.
        #
        # **Returned only when sections=teamdetails**
        teamName: String
        # Vector Directory Number
        #
        # **Returned only when sections=teamdetails**
        teamMemberVdn: String
        # The VDN for the Provider's inquiries of this customer.
        #
        # **Returned only when sections=teamdetails**
        teamProviderVdn: String
        # The VDN for the Utilization Management's inquiries of this customer.
        #
        # **Returned only when sections=teamdetails**
        teamUmVdn: String
      }

      # A single validation error detail
      type validationErrorDetails {
        # field that failed validation
        field: String!
        # description of the failed validation
        message: String!
        # name of the api that has the validation error
        name: String!
        # value that failed the validation
        value: String!
      }

      schema {
              query: RootQuery
              mutation: RootMutation
      }
    `),
  rootValue: {
    events: () => {
      return events;
    },
    createEvent: (args) => {
      const event = {
        _id: Math.random().toString(),
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: args.eventInput.date
      };

      events.push(event);
      return event;
    }
  },
  graphiql: true

})
);

app.listen(3000, () => console.log('Listening on port 3000.....'));

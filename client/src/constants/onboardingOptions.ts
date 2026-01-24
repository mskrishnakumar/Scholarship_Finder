export interface OnboardingOption {
  value: string
  label: { en: string; hi: string; ta: string; te: string }
}

export interface OnboardingStep {
  id: string
  question: { en: string; hi: string; ta: string; te: string }
  options: OnboardingOption[]
}

export const CATEGORY_OPTIONS: OnboardingOption[] = [
  { value: 'SC', label: { en: 'Scheduled Caste (SC)', hi: 'अनुसूचित जाति (SC)', ta: 'பட்டியல் சாதி (SC)', te: 'షెడ్యూల్డ్ కులం (SC)' } },
  { value: 'ST', label: { en: 'Scheduled Tribe (ST)', hi: 'अनुसूचित जनजाति (ST)', ta: 'பட்டியல் பழங்குடி (ST)', te: 'షెడ్యూల్డ్ తెగ (ST)' } },
  { value: 'OBC', label: { en: 'Other Backward Class (OBC)', hi: 'अन्य पिछड़ा वर्ग (OBC)', ta: 'பிற பிற்படுத்தப்பட்ட வகுப்பு (OBC)', te: 'ఇతర వెనుకబడిన తరగతి (OBC)' } },
  { value: 'General', label: { en: 'General', hi: 'सामान्य', ta: 'பொது', te: 'జనరల్' } }
]

export const EDUCATION_OPTIONS: OnboardingOption[] = [
  { value: 'class_1_to_8', label: { en: 'Class 1-8', hi: 'कक्षा 1-8', ta: 'வகுப்பு 1-8', te: 'తరగతి 1-8' } },
  { value: 'class_9', label: { en: 'Class 9', hi: 'कक्षा 9', ta: 'வகுப்பு 9', te: 'తరగతి 9' } },
  { value: 'class_10', label: { en: 'Class 10', hi: 'कक्षा 10', ta: 'வகுப்பு 10', te: 'తరగతి 10' } },
  { value: 'class_11', label: { en: 'Class 11', hi: 'कक्षा 11', ta: 'வகுப்பு 11', te: 'తరగతి 11' } },
  { value: 'class_12', label: { en: 'Class 12', hi: 'कक्षा 12', ta: 'வகுப்பு 12', te: 'తరగతి 12' } },
  { value: 'undergraduate', label: { en: 'Undergraduate (UG)', hi: 'स्नातक (UG)', ta: 'இளங்கலை (UG)', te: 'అండర్ గ్రాడ్యుయేట్ (UG)' } },
  { value: 'postgraduate', label: { en: 'Postgraduate (PG)', hi: 'स्नातकोत्तर (PG)', ta: 'முதுகலை (PG)', te: 'పోస్ట్ గ్రాడ్యుయేట్ (PG)' } },
  { value: 'professional', label: { en: 'Professional Course', hi: 'व्यावसायिक पाठ्यक्रम', ta: 'தொழில்முறை படிப்பு', te: 'ప్రొఫెషనల్ కోర్సు' } }
]

export const INCOME_OPTIONS: OnboardingOption[] = [
  { value: '100000', label: { en: 'Below Rs. 1 Lakh', hi: '1 लाख से कम', ta: 'ரூ. 1 லட்சத்திற்கு கீழ்', te: 'రూ. 1 లక్ష కంటే తక్కువ' } },
  { value: '200000', label: { en: 'Rs. 1-2 Lakh', hi: '1-2 लाख', ta: 'ரூ. 1-2 லட்சம்', te: 'రూ. 1-2 లక్షలు' } },
  { value: '300000', label: { en: 'Rs. 2-3 Lakh', hi: '2-3 लाख', ta: 'ரூ. 2-3 லட்சம்', te: 'రూ. 2-3 లక్షలు' } },
  { value: '500000', label: { en: 'Rs. 3-5 Lakh', hi: '3-5 लाख', ta: 'ரூ. 3-5 லட்சம்', te: 'రూ. 3-5 లక్షలు' } },
  { value: '800000', label: { en: 'Rs. 5-8 Lakh', hi: '5-8 लाख', ta: 'ரூ. 5-8 லட்சம்', te: 'రూ. 5-8 లక్షలు' } },
  { value: '1000000', label: { en: 'Above Rs. 8 Lakh', hi: '8 लाख से अधिक', ta: 'ரூ. 8 லட்சத்திற்கு மேல்', te: 'రూ. 8 లక్షలకు పైన' } }
]

export const GENDER_OPTIONS: OnboardingOption[] = [
  { value: 'male', label: { en: 'Male', hi: 'पुरुष', ta: 'ஆண்', te: 'పురుషుడు' } },
  { value: 'female', label: { en: 'Female', hi: 'महिला', ta: 'பெண்', te: 'స్త్రీ' } },
  { value: 'other', label: { en: 'Other', hi: 'अन्य', ta: 'மற்றவை', te: 'ఇతరం' } }
]

export const DISABILITY_OPTIONS: OnboardingOption[] = [
  { value: 'true', label: { en: 'Yes', hi: 'हां', ta: 'ஆம்', te: 'అవును' } },
  { value: 'false', label: { en: 'No', hi: 'नहीं', ta: 'இல்லை', te: 'కాదు' } }
]

export const RELIGION_OPTIONS: OnboardingOption[] = [
  { value: 'Hindu', label: { en: 'Hindu', hi: 'हिंदू', ta: 'இந்து', te: 'హిందూ' } },
  { value: 'Muslim', label: { en: 'Muslim', hi: 'मुस्लिम', ta: 'முஸ்லிம்', te: 'ముస్లిం' } },
  { value: 'Christian', label: { en: 'Christian', hi: 'ईसाई', ta: 'கிறிஸ்தவர்', te: 'క్రైస్తవం' } },
  { value: 'Sikh', label: { en: 'Sikh', hi: 'सिख', ta: 'சீக்கியர்', te: 'సిక్కు' } },
  { value: 'Buddhist', label: { en: 'Buddhist', hi: 'बौद्ध', ta: 'புத்தர்', te: 'బౌద్ధం' } },
  { value: 'Jain', label: { en: 'Jain', hi: 'जैन', ta: 'ஜைனர்', te: 'జైనం' } },
  { value: 'other', label: { en: 'Other', hi: 'अन्य', ta: 'மற்றவை', te: 'ఇతరం' } }
]

export const AREA_OPTIONS: OnboardingOption[] = [
  { value: 'urban', label: { en: 'Urban', hi: 'शहरी', ta: 'நகர்ப்புறம்', te: 'పట్టణ' } },
  { value: 'rural', label: { en: 'Rural', hi: 'ग्रामीण', ta: 'கிராமப்புறம்', te: 'గ్రామీణ' } }
]

export const COURSE_OPTIONS: OnboardingOption[] = [
  { value: 'engineering', label: { en: 'Engineering', hi: 'इंजीनियरिंग', ta: 'பொறியியல்', te: 'ఇంజినీరింగ్' } },
  { value: 'medical', label: { en: 'Medical', hi: 'चिकित्सा', ta: 'மருத்துவம்', te: 'వైద్యం' } },
  { value: 'science', label: { en: 'Science', hi: 'विज्ञान', ta: 'அறிவியல்', te: 'సైన్స్' } },
  { value: 'commerce', label: { en: 'Commerce', hi: 'वाणिज्य', ta: 'வணிகம்', te: 'కామర్స్' } },
  { value: 'law', label: { en: 'Law', hi: 'कानून', ta: 'சட்டம்', te: 'న్యాయశాస్త్రం' } },
  { value: 'management', label: { en: 'Management/MBA', hi: 'प्रबंधन/MBA', ta: 'மேலாண்மை/MBA', te: 'మేనేజ్‌మెంట్/MBA' } },
  { value: 'arts', label: { en: 'Arts/Humanities', hi: 'कला/मानविकी', ta: 'கலை/மானுடவியல்', te: 'కళలు/మానవీయశాస్త్రాలు' } },
  { value: 'other', label: { en: 'Other', hi: 'अन्य', ta: 'மற்றவை', te: 'ఇతరం' } }
]

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'state',
    question: { en: 'Which state are you from?', hi: 'आप किस राज्य से हैं?', ta: 'நீங்கள் எந்த மாநிலத்தைச் சேர்ந்தவர்?', te: 'మీరు ఏ రాష్ట్రం నుండి వచ్చారు?' },
    options: [] // Uses INDIAN_STATES separately
  },
  {
    id: 'category',
    question: { en: 'What is your caste category?', hi: 'आपकी जाति श्रेणी क्या है?', ta: 'உங்கள் சாதி வகை என்ன?', te: 'మీ కులం వర్గం ఏమిటి?' },
    options: CATEGORY_OPTIONS
  },
  {
    id: 'educationLevel',
    question: { en: 'What is your current education level?', hi: 'आपका वर्तमान शिक्षा स्तर क्या है?', ta: 'உங்கள் தற்போதைய கல்வி நிலை என்ன?', te: 'మీ ప్రస్తుత విద్యా స్థాయి ఏమిటి?' },
    options: EDUCATION_OPTIONS
  },
  {
    id: 'income',
    question: { en: 'What is your annual family income?', hi: 'आपकी वार्षिक पारिवारिक आय कितनी है?', ta: 'உங்கள் ஆண்டு குடும்ப வருமானம் என்ன?', te: 'మీ వార్షిక కుటుంబ ఆదాయం ఎంత?' },
    options: INCOME_OPTIONS
  },
  {
    id: 'gender',
    question: { en: 'What is your gender?', hi: 'आपका लिंग क्या है?', ta: 'உங்கள் பாலினம் என்ன?', te: 'మీ లింగం ఏమిటి?' },
    options: GENDER_OPTIONS
  },
  {
    id: 'disability',
    question: { en: 'Do you have any disability (40% or more)?', hi: 'क्या आपको कोई विकलांगता है (40% या अधिक)?', ta: 'உங்களுக்கு ஏதேனும் குறைபாடு உள்ளதா (40% அல்லது அதற்கு மேல்)?', te: 'మీకు ఏదైనా వైకల్యం ఉందా (40% లేదా అంతకంటే ఎక్కువ)?' },
    options: DISABILITY_OPTIONS
  },
  {
    id: 'religion',
    question: { en: 'What is your religion/community?', hi: 'आपका धर्म/समुदाय क्या है?', ta: 'உங்கள் மதம்/சமூகம் என்ன?', te: 'మీ మతం/సమాజం ఏమిటి?' },
    options: RELIGION_OPTIONS
  },
  {
    id: 'area',
    question: { en: 'Do you live in an urban or rural area?', hi: 'आप शहरी क्षेत्र में रहते हैं या ग्रामीण?', ta: 'நீங்கள் நகர்ப்புறத்தில் வசிக்கிறீர்களா அல்லது கிராமப்புறத்தில்?', te: 'మీరు పట్టణ ప్రాంతంలో నివసిస్తున్నారా లేదా గ్రామీణ ప్రాంతంలో?' },
    options: AREA_OPTIONS
  },
  {
    id: 'course',
    question: { en: 'What field/course are you pursuing or planning to pursue?', hi: 'आप कौन सा क्षेत्र/पाठ्यक्रम कर रहे हैं या करने की योजना बना रहे हैं?', ta: 'நீங்கள் எந்த துறை/படிப்பை படிக்கிறீர்கள் அல்லது படிக்க திட்டமிட்டுள்ளீர்கள்?', te: 'మీరు ఏ రంగం/కోర్సు చదువుతున్నారు లేదా చదవాలని ప్లాన్ చేస్తున్నారు?' },
    options: COURSE_OPTIONS
  }
]

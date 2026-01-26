import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { filterScholarships, GuidedFlowFilters, Scholarship } from '../shared/scholarshipData.js'

interface StepDefinition {
  id: string
  question: string
  questionHi: string
  options: Array<{ value: string; label: string; labelHi: string }>
  filterKey: keyof GuidedFlowFilters
}

const STEPS: StepDefinition[] = [
  {
    id: 'state',
    question: 'Which state are you from?',
    questionHi: 'आप किस राज्य से हैं?',
    filterKey: 'state',
    options: [
      { value: 'Maharashtra', label: 'Maharashtra', labelHi: 'महाराष्ट्र' },
      { value: 'Karnataka', label: 'Karnataka', labelHi: 'कर्नाटक' },
      { value: 'Tamil Nadu', label: 'Tamil Nadu', labelHi: 'तमिलनाडु' },
      { value: 'Uttar Pradesh', label: 'Uttar Pradesh', labelHi: 'उत्तर प्रदेश' },
      { value: 'Rajasthan', label: 'Rajasthan', labelHi: 'राजस्थान' },
      { value: 'Madhya Pradesh', label: 'Madhya Pradesh', labelHi: 'मध्य प्रदेश' },
      { value: 'West Bengal', label: 'West Bengal', labelHi: 'पश्चिम बंगाल' },
      { value: 'Gujarat', label: 'Gujarat', labelHi: 'गुजरात' },
      { value: 'Odisha', label: 'Odisha', labelHi: 'ओडिशा' },
      { value: 'Jammu and Kashmir', label: 'Jammu & Kashmir', labelHi: 'जम्मू और कश्मीर' },
      { value: 'Assam', label: 'Assam', labelHi: 'असम' },
      { value: 'other', label: 'Other State', labelHi: 'अन्य राज्य' }
    ]
  },
  {
    id: 'category',
    question: 'What is your caste category?',
    questionHi: 'आपकी जाति श्रेणी क्या है?',
    filterKey: 'category',
    options: [
      { value: 'SC', label: 'Scheduled Caste (SC)', labelHi: 'अनुसूचित जाति (SC)' },
      { value: 'ST', label: 'Scheduled Tribe (ST)', labelHi: 'अनुसूचित जनजाति (ST)' },
      { value: 'OBC', label: 'Other Backward Class (OBC)', labelHi: 'अन्य पिछड़ा वर्ग (OBC)' },
      { value: 'General', label: 'General', labelHi: 'सामान्य' }
    ]
  },
  {
    id: 'income',
    question: 'What is your annual family income?',
    questionHi: 'आपकी वार्षिक पारिवारिक आय कितनी है?',
    filterKey: 'income',
    options: [
      { value: '100000', label: 'Below Rs. 1 Lakh', labelHi: '1 लाख से कम' },
      { value: '200000', label: 'Rs. 1-2 Lakh', labelHi: '1-2 लाख' },
      { value: '300000', label: 'Rs. 2-3 Lakh', labelHi: '2-3 लाख' },
      { value: '500000', label: 'Rs. 3-5 Lakh', labelHi: '3-5 लाख' },
      { value: '800000', label: 'Rs. 5-8 Lakh', labelHi: '5-8 लाख' },
      { value: '1000000', label: 'Above Rs. 8 Lakh', labelHi: '8 लाख से अधिक' }
    ]
  },
  {
    id: 'educationLevel',
    question: 'What is your current education level?',
    questionHi: 'आपका वर्तमान शिक्षा स्तर क्या है?',
    filterKey: 'educationLevel',
    options: [
      { value: 'class_1_to_8', label: 'Class 1-8', labelHi: 'कक्षा 1-8' },
      { value: 'class_9', label: 'Class 9', labelHi: 'कक्षा 9' },
      { value: 'class_10', label: 'Class 10', labelHi: 'कक्षा 10' },
      { value: 'class_11', label: 'Class 11', labelHi: 'कक्षा 11' },
      { value: 'class_12', label: 'Class 12', labelHi: 'कक्षा 12' },
      { value: 'undergraduate', label: 'Undergraduate (UG)', labelHi: 'स्नातक (UG)' },
      { value: 'postgraduate', label: 'Postgraduate (PG)', labelHi: 'स्नातकोत्तर (PG)' },
      { value: 'professional', label: 'Professional Course', labelHi: 'व्यावसायिक पाठ्यक्रम' }
    ]
  },
  {
    id: 'gender',
    question: 'What is your gender?',
    questionHi: 'आपका लिंग क्या है?',
    filterKey: 'gender',
    options: [
      { value: 'male', label: 'Male', labelHi: 'पुरुष' },
      { value: 'female', label: 'Female', labelHi: 'महिला' },
      { value: 'other', label: 'Other', labelHi: 'अन्य' }
    ]
  },
  {
    id: 'disability',
    question: 'Do you have any disability (40% or more)?',
    questionHi: 'क्या आपको कोई विकलांगता है (40% या अधिक)?',
    filterKey: 'disability',
    options: [
      { value: 'true', label: 'Yes', labelHi: 'हां' },
      { value: 'false', label: 'No', labelHi: 'नहीं' }
    ]
  },
  {
    id: 'religion',
    question: 'What is your religion/community?',
    questionHi: 'आपका धर्म/समुदाय क्या है?',
    filterKey: 'religion',
    options: [
      { value: 'Hindu', label: 'Hindu', labelHi: 'हिंदू' },
      { value: 'Muslim', label: 'Muslim', labelHi: 'मुस्लिम' },
      { value: 'Christian', label: 'Christian', labelHi: 'ईसाई' },
      { value: 'Sikh', label: 'Sikh', labelHi: 'सिख' },
      { value: 'Buddhist', label: 'Buddhist', labelHi: 'बौद्ध' },
      { value: 'Jain', label: 'Jain', labelHi: 'जैन' },
      { value: 'other', label: 'Other', labelHi: 'अन्य' }
    ]
  },
  {
    id: 'area',
    question: 'Do you live in an urban or rural area?',
    questionHi: 'आप शहरी क्षेत्र में रहते हैं या ग्रामीण?',
    filterKey: 'area',
    options: [
      { value: 'urban', label: 'Urban', labelHi: 'शहरी' },
      { value: 'rural', label: 'Rural', labelHi: 'ग्रामीण' }
    ]
  },
  {
    id: 'course',
    question: 'What field/course are you pursuing or planning to pursue?',
    questionHi: 'आप कौन सा क्षेत्र/पाठ्यक्रम कर रहे हैं या करने की योजना बना रहे हैं?',
    filterKey: 'course',
    options: [
      { value: 'engineering', label: 'Engineering', labelHi: 'इंजीनियरिंग' },
      { value: 'medical', label: 'Medical', labelHi: 'चिकित्सा' },
      { value: 'science', label: 'Science', labelHi: 'विज्ञान' },
      { value: 'commerce', label: 'Commerce', labelHi: 'वाणिज्य' },
      { value: 'law', label: 'Law', labelHi: 'कानून' },
      { value: 'management', label: 'Management/MBA', labelHi: 'प्रबंधन/MBA' },
      { value: 'arts', label: 'Arts/Humanities', labelHi: 'कला/मानविकी' },
      { value: 'other', label: 'Other', labelHi: 'अन्य' }
    ]
  }
]

function formatScholarshipResult(scholarship: Scholarship, language: string) {
  return {
    id: scholarship.id,
    name: scholarship.name,
    description: scholarship.description,
    benefits: scholarship.benefits,
    deadline: scholarship.deadline,
    applicationSteps: scholarship.applicationSteps,
    requiredDocuments: scholarship.requiredDocuments,
    officialUrl: scholarship.officialUrl
  }
}

async function guidedFlow(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Guided flow endpoint called')

  try {
    const body = await request.json() as {
      step?: string
      answers?: Record<string, string>
      language?: string
    }

    const language = body.language || 'en'
    const answers = body.answers || {}
    const currentStep = body.step || 'start'

    // Handle start - return the first question
    if (currentStep === 'start') {
      const firstStep = STEPS[0]
      return {
        status: 200,
        jsonBody: {
          step: firstStep.id,
          stepIndex: 0,
          totalSteps: STEPS.length,
          question: language === 'hi' ? firstStep.questionHi : firstStep.question,
          options: firstStep.options.map(o => ({
            value: o.value,
            label: language === 'hi' ? o.labelHi : o.label
          }))
        }
      }
    }

    // Find current step index
    const currentIndex = STEPS.findIndex(s => s.id === currentStep)
    if (currentIndex === -1) {
      return {
        status: 400,
        jsonBody: { error: `Invalid step: ${currentStep}` }
      }
    }

    // Check if there's a next step
    const nextIndex = currentIndex + 1

    if (nextIndex < STEPS.length) {
      // Return next question
      const nextStep = STEPS[nextIndex]
      return {
        status: 200,
        jsonBody: {
          step: nextStep.id,
          stepIndex: nextIndex,
          totalSteps: STEPS.length,
          question: language === 'hi' ? nextStep.questionHi : nextStep.question,
          options: nextStep.options.map(o => ({
            value: o.value,
            label: language === 'hi' ? o.labelHi : o.label
          }))
        }
      }
    }

    // All questions answered - filter and return results
    const filters: GuidedFlowFilters = {}

    if (answers.state && answers.state !== 'other') filters.state = answers.state
    if (answers.category) filters.category = answers.category
    if (answers.income) filters.income = parseInt(answers.income)
    if (answers.educationLevel) filters.educationLevel = answers.educationLevel
    if (answers.gender) filters.gender = answers.gender
    if (answers.disability) filters.disability = answers.disability === 'true'
    if (answers.religion && answers.religion !== 'other') filters.religion = answers.religion
    if (answers.area) filters.area = answers.area
    if (answers.course && answers.course !== 'other') filters.course = answers.course

    const matchingScholarships = await filterScholarships(filters)

    return {
      status: 200,
      jsonBody: {
        step: 'results',
        totalResults: matchingScholarships.length,
        results: matchingScholarships.map(s => formatScholarshipResult(s, language))
      }
    }
  } catch (error: any) {
    context.error('Guided flow error:', error)
    return {
      status: 500,
      jsonBody: { error: 'Internal server error', details: error.message }
    }
  }
}

app.http('guided-flow', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: guidedFlow
})

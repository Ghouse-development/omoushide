import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBQVbYEVwPAzdAImoMIVc4c5z4eni4W3KA';

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';
    let responseFormat = 'text';

    switch (action) {
      case 'summarize':
        responseFormat = 'json';
        prompt = `以下の顧客対応ログを分析し、時系列で経緯を整理してください。

【出力形式】
以下のJSON形式で出力してください。必ず有効なJSONのみを出力し、他のテキストは含めないでください。
[
  {"date": "日時", "person": "相手", "summary": "経緯要約（20文字以内）", "detail": "詳細内容"},
  ...
]

【注意事項】
- 日時が不明な場合は「不明」と記載
- 相手が不明な場合は「顧客」「担当者」などで記載
- 最大10件まで抽出
- 重要な出来事を時系列順に整理

【対応ログ】
${data.logText}`;
        break;

      case 'suggestCause':
        prompt = `以下のクレーム対応経緯を分析し、考えられる原因を3つ提案してください。

【出力形式】
【考えられる原因】

1. [原因1のタイトル]
   └ 詳細説明

2. [原因2のタイトル]
   └ 詳細説明

3. [原因3のタイトル]
   └ 詳細説明

【経緯データ】
${data.history?.map((h: { date: string; summary: string; detail: string }) => `${h.date}: ${h.summary} - ${h.detail}`).join('\n') || ''}

【元のログ】
${data.logText || ''}`;
        break;

      case 'suggestCountermeasure':
        prompt = `以下のクレーム対応経緯と原因を踏まえ、具体的な対策を3つ提案してください。

【出力形式】
【改善対策案】

■ 対策1: [タイトル]
  内容: [具体的な対策内容]
  効果: [期待される効果]
  実施時期: [即時/短期/中長期]

■ 対策2: [タイトル]
  内容: [具体的な対策内容]
  効果: [期待される効果]
  実施時期: [即時/短期/中長期]

■ 対策3: [タイトル]
  内容: [具体的な対策内容]
  効果: [期待される効果]
  実施時期: [即時/短期/中長期]

【経緯データ】
${data.history?.map((h: { date: string; summary: string }) => `${h.date}: ${h.summary}`).join('\n') || ''}

【原因】
${data.cause || '（未入力）'}

【元のログ】
${data.logText || ''}`;
        break;

      case 'generateVisualSheet':
        responseFormat = 'json';
        prompt = `以下のクレーム対応情報を分析し、ビジュアル報告書用のデータを生成してください。

【出力形式】
必ず以下のJSON形式のみで出力してください。他のテキストは含めないでください。
{
  "title": "キャッチフレーズ（20文字以内）",
  "summary": "経緯のサマリー（100文字以内）",
  "rootCause": "根本原因（50文字以内）",
  "causeAnalysis": "原因の詳細分析（100文字以内）",
  "countermeasures": [
    {
      "title": "対策タイトル1",
      "content": "対策内容1（50文字以内）",
      "priority": "高"
    },
    {
      "title": "対策タイトル2",
      "content": "対策内容2（50文字以内）",
      "priority": "中"
    },
    {
      "title": "対策タイトル3",
      "content": "対策内容3（50文字以内）",
      "priority": "低"
    }
  ],
  "expectedEffect": "期待される効果（100文字以内）"
}

【経緯データ】
${data.history?.map((h: { date: string; summary: string; detail: string }) => `${h.date}: ${h.summary} - ${h.detail}`).join('\n') || ''}

【原因（ユーザー入力）】
${data.cause || '（未入力）'}

【対策（ユーザー入力）】
${data.countermeasure || '（未入力）'}

【元のログ】
${data.logText || '（なし）'}`;
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (responseFormat === 'json') {
      // JSONを抽出
      const jsonMatch = text.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: text });
        }
      }
    }

    return NextResponse.json({ success: true, data: text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'API Error' },
      { status: 500 }
    );
  }
}

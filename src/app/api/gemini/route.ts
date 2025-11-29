import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// レート制限用のシンプルなメモリストア
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 1分あたりのリクエスト数
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// 環境変数からAPIキーを取得（フォールバックなし）
const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  // APIキーチェック
  if (!API_KEY) {
    console.error('GEMINI_API_KEY is not configured');
    return NextResponse.json(
      { success: false, error: 'サーバー設定エラー: APIキーが設定されていません' },
      { status: 500 }
    );
  }

  // レート制限チェック
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'リクエスト制限に達しました。1分後に再試行してください。' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { action, data } = body;

    // 入力バリデーション
    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { success: false, error: '無効なリクエスト: actionが必要です' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: '無効なリクエスト: dataが必要です' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';
    let responseFormat = 'text';

    switch (action) {
      case 'summarize':
        if (!data.logText || typeof data.logText !== 'string' || data.logText.trim().length < 10) {
          return NextResponse.json(
            { success: false, error: 'ログテキストが短すぎます（10文字以上必要）' },
            { status: 400 }
          );
        }
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
${data.history?.map((h: { date: string; summary: string; detail: string }) => `${h.date}: ${h.summary} - ${h.detail}`).join('\n') || '経緯データなし'}

【元のログ】
${data.logText || '（なし）'}`;
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
${data.history?.map((h: { date: string; summary: string }) => `${h.date}: ${h.summary}`).join('\n') || '経緯データなし'}

【原因】
${data.cause || '（未入力）'}

【元のログ】
${data.logText || '（なし）'}`;
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
${data.history?.map((h: { date: string; summary: string; detail: string }) => `${h.date}: ${h.summary} - ${h.detail}`).join('\n') || '経緯データなし'}

【原因（ユーザー入力）】
${data.cause || '（未入力）'}

【対策（ユーザー入力）】
${data.countermeasure || '（未入力）'}

【元のログ】
${data.logText || '（なし）'}`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: `無効なアクション: ${action}` },
          { status: 400 }
        );
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (responseFormat === 'json') {
      const jsonMatch = text.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, data: parsed });
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return NextResponse.json(
            { success: false, error: 'AIの応答を解析できませんでした。再試行してください。' },
            { status: 500 }
          );
        }
      }
      return NextResponse.json(
        { success: false, error: 'AIからの応答形式が不正です。再試行してください。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: text });

  } catch (error) {
    console.error('Gemini API Error:', error);

    // エラータイプに応じたメッセージ
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'リクエストの形式が不正です' },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('API_KEY')) {
      return NextResponse.json(
        { success: false, error: 'APIキーが無効です' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return NextResponse.json(
        { success: false, error: 'API利用制限に達しました。しばらく待ってから再試行してください。' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'AI処理中にエラーが発生しました。再試行してください。' },
      { status: 500 }
    );
  }
}

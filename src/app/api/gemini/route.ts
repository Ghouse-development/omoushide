import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 定数
const MAX_LOG_LENGTH = 50000; // 最大50000文字
const MIN_LOG_LENGTH = 10;
const API_TIMEOUT = 30000; // 30秒タイムアウト
const RATE_LIMIT = 10; // 1分あたりのリクエスト数
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分

// レート制限用のシンプルなメモリストア
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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

// 入力サニタイズ（XSS対策）
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // HTMLタグ除去
    .replace(/javascript:/gi, '') // javascript: プロトコル除去
    .replace(/on\w+=/gi, '') // イベントハンドラ除去
    .trim();
}

// タイムアウト付きPromise
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), ms)
  );
  return Promise.race([promise, timeout]);
}

// 環境変数からAPIキーを取得
const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  // APIキーチェック
  if (!API_KEY) {
    console.error('GEMINI_API_KEY is not configured');
    return NextResponse.json(
      { success: false, error: 'サーバー設定エラー: APIキーが設定されていません。管理者にお問い合わせください。' },
      { status: 500 }
    );
  }

  // レート制限チェック
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'リクエスト制限に達しました。1分後に再試行してください。' },
      { status: 429 }
    );
  }

  try {
    // リクエストサイズチェック
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB制限
      return NextResponse.json(
        { success: false, error: 'リクエストサイズが大きすぎます（最大1MB）' },
        { status: 413 }
      );
    }

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

    // ログテキストのサニタイズと検証
    const logText = sanitizeInput(data.logText || '');

    switch (action) {
      case 'summarize':
        if (logText.length < MIN_LOG_LENGTH) {
          return NextResponse.json(
            { success: false, error: `ログテキストが短すぎます（${MIN_LOG_LENGTH}文字以上必要）` },
            { status: 400 }
          );
        }
        if (logText.length > MAX_LOG_LENGTH) {
          return NextResponse.json(
            { success: false, error: `ログテキストが長すぎます（最大${MAX_LOG_LENGTH}文字）` },
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
${logText}`;
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
${data.history?.map((h: { date: string; summary: string; detail: string }) => `${sanitizeInput(h.date)}: ${sanitizeInput(h.summary)} - ${sanitizeInput(h.detail)}`).join('\n') || '経緯データなし'}

【元のログ】
${logText || '（なし）'}`;
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
${data.history?.map((h: { date: string; summary: string }) => `${sanitizeInput(h.date)}: ${sanitizeInput(h.summary)}`).join('\n') || '経緯データなし'}

【原因】
${sanitizeInput(data.cause) || '（未入力）'}

【元のログ】
${logText || '（なし）'}`;
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
${data.history?.map((h: { date: string; summary: string; detail: string }) => `${sanitizeInput(h.date)}: ${sanitizeInput(h.summary)} - ${sanitizeInput(h.detail)}`).join('\n') || '経緯データなし'}

【原因（ユーザー入力）】
${sanitizeInput(data.cause) || '（未入力）'}

【対策（ユーザー入力）】
${sanitizeInput(data.countermeasure) || '（未入力）'}

【元のログ】
${logText || '（なし）'}`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: `無効なアクション: ${action}` },
          { status: 400 }
        );
    }

    // タイムアウト付きでAPI呼び出し
    const result = await withTimeout(
      model.generateContent(prompt),
      API_TIMEOUT
    );
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Gemini API Error:', errorMessage, errorStack);

    // タイムアウトエラー
    if (errorMessage === 'TIMEOUT') {
      return NextResponse.json(
        { success: false, error: 'AI処理がタイムアウトしました。もう一度お試しください。' },
        { status: 504 }
      );
    }

    // リクエスト形式エラー
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'リクエストの形式が不正です' },
        { status: 400 }
      );
    }

    // APIキーエラー
    if (errorMessage.includes('API_KEY') || errorMessage.includes('API key')) {
      return NextResponse.json(
        { success: false, error: 'APIキーが無効です。管理者にお問い合わせください。' },
        { status: 401 }
      );
    }

    // レート制限エラー
    if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { success: false, error: 'API利用制限に達しました。しばらく待ってから再試行してください。' },
        { status: 429 }
      );
    }

    // ネットワークエラー
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { success: false, error: 'ネットワークエラーが発生しました。インターネット接続を確認してください。' },
        { status: 503 }
      );
    }

    // モデルが見つからないエラー
    if (errorMessage.includes('not found') || errorMessage.includes('model')) {
      return NextResponse.json(
        { success: false, error: 'AIモデルが利用できません。管理者にお問い合わせください。' },
        { status: 500 }
      );
    }

    // GoogleGenerativeAI固有のエラー
    if (errorMessage.includes('GoogleGenerativeAI') || errorMessage.includes('generativelanguage')) {
      return NextResponse.json(
        { success: false, error: `Gemini APIエラー: ${errorMessage.substring(0, 100)}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: `AI処理中にエラーが発生しました: ${errorMessage.substring(0, 100)}` },
      { status: 500 }
    );
  }
}

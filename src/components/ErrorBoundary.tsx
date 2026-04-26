import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "抱歉，应用遇到了一个意外错误";
      let detailMessage = this.state.error?.message || "";

      // Check if it's a Firestore JSON error
      try {
        if (detailMessage.startsWith('{') && detailMessage.endsWith('}')) {
          const errData = JSON.parse(detailMessage);
          if (errData.error && errData.error.includes('permission-denied')) {
            errorMessage = "权限不足：您可能没有权限执行此操作或查看此数据";
          }
        }
      } catch (e) {
        // Not a JSON error or parsing failed
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center space-y-8 border-4 border-rose-100">
            <div className="w-20 h-20 bg-rose-100 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-rose-950 tracking-tight">
                {errorMessage}
              </h2>
              <p className="text-rose-400 font-medium text-sm">
                我们已经记录了此错误，您可以尝试刷新页面或返回首页。              </p>
            </div>

            {detailMessage && (
              <div className="p-4 bg-rose-50 rounded-2xl text-left overflow-hidden">
                <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-2">错误详情</p>
                <p className="text-xs font-mono text-rose-400 break-all line-clamp-3">
                  {detailMessage}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full btn-accessible bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <RefreshCw size={20} /> 刷新页面
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full btn-accessible bg-rose-50 text-rose-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 border-2 border-rose-100"
              >
                <Home size={20} /> 返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

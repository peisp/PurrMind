import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetail: false
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('应用渲染异常:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetail: false
    })
  }

  toggleDetail = () => {
    this.setState(prev => ({ showDetail: !prev.showDetail }))
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetail } = this.state
      return (
        <div className='flex h-screen items-center justify-center p-6'>
          <div className='text-center space-y-4 max-w-lg'>
            <h2 className='text-lg font-semibold text-destructive'>
              应用出现异常
            </h2>
            <p className='text-sm text-muted-foreground'>
              {error?.message || '未知错误'}
            </p>
            <div className='flex items-center justify-center gap-3'>
              <button
                onClick={this.handleReset}
                className='px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90'
              >
                重试
              </button>
              <button
                onClick={this.toggleDetail}
                className='px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                {showDetail ? '收起' : '详情'}
              </button>
            </div>
            {showDetail && (
              <div className='mt-4 text-left bg-muted/50 rounded-lg p-4 overflow-auto max-h-60'>
                <p className='text-xs font-mono text-destructive whitespace-pre-wrap break-all'>
                  {error?.stack || error?.message}
                </p>
                {errorInfo?.componentStack && (
                  <p className='mt-2 text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all'>
                    {errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

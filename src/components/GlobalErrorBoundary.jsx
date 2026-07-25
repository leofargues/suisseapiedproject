import React from 'react';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("GlobalErrorBoundary Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-100 text-red-900 rounded-xl m-4 border-2 border-red-500">
          <h2 className="font-bold text-xl mb-4">💥 Crash de l'application !</h2>
          <p className="mb-2 text-sm font-semibold">Le composant a planté avec l'erreur suivante :</p>
          <pre className="bg-red-50 p-4 rounded text-xs overflow-auto border border-red-200">
            {this.state.error && this.state.error.toString()}
            <br/><br/>
            {this.state.error && this.state.error.stack}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Réessayer de charger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

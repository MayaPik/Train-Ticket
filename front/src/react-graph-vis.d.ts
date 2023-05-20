declare module "react-graph-vis" {
  import { ComponentType } from "react";

  interface Node {
    name: string;
    vulnerable?: string;
  }

  interface Edge {
    from: string | number;
    to: string | number;
  }

  interface GraphProps {
    graph: {
      nodes: Node[];
      edges: Edge[];
    };
    options?: object;
    events?: object;
    className?: string;
  }

  const Graph: ComponentType<GraphProps>;

  export default Graph;
}

import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteractionAssigned } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import type Property from './Property';
import type RestElement from './RestElement';
import type { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class ObjectPattern extends NodeBase implements PatternNode {
	declare properties: readonly (Property | RestElement)[];
	declare type: NodeType.tObjectPattern;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		for (const property of this.properties) {
			if (property.type === NodeType.Property) {
				(property.value as unknown as PatternNode).addExportedVariables(
					variables,
					exportNamesByVariable
				);
			} else {
				property.argument.addExportedVariables(variables, exportNamesByVariable);
			}
		}
	}

	declare(kind: VariableKind, init: ExpressionEntity): LocalVariable[] {
		const variables: LocalVariable[] = [];
		for (const property of this.properties) {
			variables.push(...property.declare(kind, init));
		}
		return variables;
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) {
			for (const property of this.properties) {
				property.deoptimizePath(path);
			}
		}
	}

	hasEffectsOnInteractionAtPath(
		// At the moment, this is only triggered for assignment left-hand sides,
		// where the path is empty
		_path: ObjectPath,
		interaction: NodeInteractionAssigned,
		context: HasEffectsContext
	): boolean {
		for (const property of this.properties) {
			if (property.hasEffectsOnInteractionAtPath(EMPTY_PATH, interaction, context)) return true;
		}
		return false;
	}

	markDeclarationReached(): void {
		for (const property of this.properties) {
			property.markDeclarationReached();
		}
	}
}

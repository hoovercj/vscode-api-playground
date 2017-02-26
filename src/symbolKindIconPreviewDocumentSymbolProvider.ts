import { ExtensionContext, DocumentSymbolProvider, languages, TextDocument, CancellationToken, SymbolInformation, SymbolKind, Location, Position, DocumentFilter } from 'vscode';

export class SymbolKindIconPreviewDocumentSymbolProvider implements DocumentSymbolProvider {

    private context: ExtensionContext;

    constructor(context: ExtensionContext) {
        this.context = context;
    }

    public register() {
        let symbolProviderRegistration = languages.registerDocumentSymbolProvider(<DocumentFilter>{ language: 'typescript', pattern: "**/icons.ts"}, this);
        this.context.subscriptions.push(symbolProviderRegistration);
    }

    public provideDocumentSymbols (document: TextDocument, token: CancellationToken): SymbolInformation[] | Thenable<SymbolInformation[]> {
        return <SymbolInformation[]>[
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Array,
                name: "Array"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Boolean,
                name: "Boolean"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Class,
                name: "Class"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Constant,
                name: "Constant"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Constructor,
                name: "Constructor"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Enum,
                name: "Enum"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Field,
                name: "Field"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.File,
                name: "File"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Function,
                name: "Function"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Interface,
                name: "Interface"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Key,
                name: "Key"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Method,
                name: "Method"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Module,
                name: "Module"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Namespace,
                name: "Namespace"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Null,
                name: "Null"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Number,
                name: "Number"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Object,
                name: "Object"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Package,
                name: "Package"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Property,
                name: "Property"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.String,
                name: "String"
            },
            {
                location: new Location(document.uri, new Position(0,0)),
                kind: SymbolKind.Variable,
                name: "Variable"
            },
        ];
    }
}